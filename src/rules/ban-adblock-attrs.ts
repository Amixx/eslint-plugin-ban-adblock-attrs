import { Rule } from 'eslint'
import * as path from 'path'
import forbiddenData from './easylist-css-selectors.json'
import { AST } from 'vue-eslint-parser'

function defineTemplateBodyVisitor(
  context: any,
  templateBodyVisitor: any,
  scriptVisitor?: any,
  options?: any
) {
  if (context.parserServices.defineTemplateBodyVisitor == null) {
    const filename = context.getFilename()
    if (path.extname(filename) === '.vue') {
      context.report({
        loc: { line: 1, column: 0 },
        message:
          'Use the latest vue-eslint-parser. See also https://eslint.vuejs.org/user-guide/#what-is-the-use-the-latest-vue-eslint-parser-error.',
      })
    }
    return {}
  }
  return context.parserServices.defineTemplateBodyVisitor(
    templateBodyVisitor,
    scriptVisitor,
    options
  )
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow specific css selectors (only ids and classes right now) that might get blocked by adblockers',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      forbiddenId: "ID '{{name}}' is forbidden.",
      forbiddenClass: "Class '{{name}}' is forbidden.",
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (!(typeof node.value === 'string')) return
        if (forbiddenData.id.includes(node.value)) {
          context.report({
            node,
            messageId: 'forbiddenId',
          })
        }
        if (forbiddenData.class.includes(node.value)) {
          context.report({
            node,
            messageId: 'forbiddenClass',
          })
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          if (!(typeof quasi.value.cooked === 'string')) return
          if (forbiddenData.id.includes(quasi.value.cooked)) {
            context.report({
              node: quasi,
              messageId: 'forbiddenId',
            })
          }
          if (forbiddenData.class.includes(quasi.value.cooked)) {
            context.report({
              node: quasi,
              messageId: 'forbiddenClass',
            })
          }
        })
      },
      ...defineTemplateBodyVisitor(context, {
        VAttribute(node: AST.VAttribute) {
          if (!node.value) return
          if (
            node.key.name === 'id' &&
            forbiddenData.id.includes(node.value.value)
          ) {
            context.report({
              node: node.value as any,
              messageId: 'forbiddenId',
            })
          }
          if (node.key.name === 'class') {
            const classNames = node.value.value.split(' ')
            for (const className of classNames) {
              if (forbiddenData.class.includes(className)) {
                context.report({
                  node: node.value as any,
                  messageId: 'forbiddenClass',
                })
              }
            }
          }
        },
      }),
    }
  },
} satisfies Rule.RuleModule
