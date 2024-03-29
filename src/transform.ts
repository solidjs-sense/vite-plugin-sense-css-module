import { dirname, join } from 'path';
import {
  createSourceFile,
  ScriptTarget,
  createPrinter,
  transform,
  visitEachChild,
  visitNode,
  Node,
  isJsxAttribute,
  isStringLiteral,
  isJsxExpression,
  isTemplateExpression,
  isObjectLiteralExpression,
  factory,
  isTemplateMiddle,
  TemplateExpression,
  isConditionalExpression,
  ConditionalExpression,
  Expression,
  StringLiteral,
  ObjectLiteralExpression,
  isPropertyAssignment,
  PropertyAssignment,
  isSpreadAssignment,
  SpreadAssignment,
  isIdentifier,
  NoSubstitutionTemplateLiteral,
  isNoSubstitutionTemplateLiteral
} from 'typescript';
import { CSSModulesOptions } from 'vite';
import { classAttributes, cssModuleImportString } from './constant';
import { getCssModulesNames } from './postcss';
import { SenseCssModuleOptions } from './type';

function updateClass(str: string, cssModules: Record<string, string>) {
  return str.split(/\s+/).map(w => {
    if (w) {
      if (cssModules[w]) {
        return cssModules[w]
      }
    }
    return w
  }).join(' ')
}

type NodeTypes =
  | PropertyAssignment
  | TemplateExpression
  | ConditionalExpression
  | StringLiteral
  | Expression
  | SpreadAssignment
  | NoSubstitutionTemplateLiteral

function updateExpression (node: NoSubstitutionTemplateLiteral, cssModules: Record<string, string>): NoSubstitutionTemplateLiteral;
function updateExpression (node: PropertyAssignment, cssModules: Record<string, string>): PropertyAssignment;
function updateExpression (node: SpreadAssignment, cssModules: Record<string, string>): SpreadAssignment;
function updateExpression (node: ObjectLiteralExpression, cssModules: Record<string, string>): ObjectLiteralExpression;
function updateExpression (node: TemplateExpression, cssModules: Record<string, string>): TemplateExpression;
function updateExpression (node: ConditionalExpression, cssModules: Record<string, string>): ConditionalExpression;
function updateExpression (node: StringLiteral, cssModules: Record<string, string>): StringLiteral;
function updateExpression (node: Expression, cssModules: Record<string, string>): Expression;
function updateExpression (node: NodeTypes, cssModules: Record<string, string>): NodeTypes {
  if (isSpreadAssignment(node)) {
    return factory.updateSpreadAssignment(node, updateExpression(node.expression, cssModules))
  } else if (isPropertyAssignment(node)) {
    return factory.updatePropertyAssignment(
      node,
      isStringLiteral(node.name)
        ? updateExpression(node.name, cssModules)
        : isIdentifier(node.name)
        ? factory.createStringLiteral(updateClass(node.name.text, cssModules))
        : node.name,
      node.initializer
    )
  } else if (isObjectLiteralExpression(node)) {
    return factory.updateObjectLiteralExpression(node, node.properties.map(p => {
      if (isPropertyAssignment(p)) {
        return updateExpression(p, cssModules)
      } else if (isSpreadAssignment(p)) {
        return updateExpression(p, cssModules)
      }
      return p
    }))
  } else if (isStringLiteral(node)) {
    return factory.createStringLiteral(updateClass(node.text, cssModules))
  } else if (isNoSubstitutionTemplateLiteral(node)) {
    return factory.createNoSubstitutionTemplateLiteral(updateClass(node.text, cssModules))
  } else if (isTemplateExpression(node)) {
    const headNode = node.head
    return factory.updateTemplateExpression(
      node,
      factory.createTemplateHead(
        updateClass(headNode.text, cssModules),
        updateClass(headNode.text, cssModules)
      ),
      node.templateSpans.map(t => {
        return factory.updateTemplateSpan(
          t,
          updateExpression(t.expression, cssModules),
          isTemplateMiddle(t.literal)
          ? factory.createTemplateMiddle(updateClass(t.literal.text, cssModules))
          : factory.createTemplateTail(updateClass(t.literal.text, cssModules))
        )
      })
    )
  } else if (isConditionalExpression(node)) {
    return factory.updateConditionalExpression(
      node,
      node.condition,
      node.questionToken,
      updateExpression(node.whenTrue, cssModules),
      node.colonToken,
      updateExpression(node.whenFalse, cssModules),
    )
  }
  return node
}

export async function resolveCssModuleClassNames(
  code: string,
  id: string,
  target: keyof typeof ScriptTarget,
  cssModulesOptions: CSSModulesOptions,
  senseCssModuleOptions?: SenseCssModuleOptions
) {
  let cssModuleClassNames: Record<string, string> = {}
  for (const line of code.split('\n')) {
    const m = line.match(cssModuleImportString)
    if (m && m[3]) {
      const cssModule = await getCssModulesNames(
        join(dirname(id), m[3]),
        {
          ...cssModulesOptions,
          localsConvention: cssModulesOptions.localsConvention === 'camelCaseOnly'
            ? 'camelCase'
            : cssModulesOptions.localsConvention === 'dashesOnly'
            ? 'dashes'
            : cssModulesOptions.localsConvention
            ? cssModulesOptions.localsConvention
            : undefined
        }
      )
      cssModuleClassNames = {
        ...cssModuleClassNames,
        ...cssModule,
      }
    }
  }

  if (!Object.keys(cssModuleClassNames).length) {
    return code
  }

  const source = createSourceFile(id, code, ScriptTarget[target], true)
  const result = transform(source, [(context) => {
    return (rootNode) => {
      function visit(node: Node): Node {
        if (isJsxAttribute(node)) {
          const { name, initializer }= node
          // jsx attribute
          // class/className/classList
          if (name && initializer && (senseCssModuleOptions?.classAttributeRegex || classAttributes).test(name.getText())) {
            // 字符串
            if (isStringLiteral(initializer)) {
              return factory.updateJsxAttribute(
                node,
                name,
                updateExpression(initializer, cssModuleClassNames)
              )
              // 表达式
            } else if (isJsxExpression(initializer) && initializer.expression) {
              return factory.updateJsxAttribute(
                node,
                name,
                factory.updateJsxExpression(initializer, updateExpression(initializer.expression, cssModuleClassNames)
                )
              )
            }
          }
        }
        return visitEachChild(node, visit, context)
      }
      return visitNode(rootNode, visit);
    }
  }])

  const printer = createPrinter()
  const transformedSourceFile = result.transformed[0];
  const newFile = printer.printFile(transformedSourceFile)
  result.dispose()
  return newFile
}
