"use client"

import { useEditor, EditorContent, EditorContext } from "@tiptap/react"

import { StarterKit } from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Mathematics } from "@tiptap/extension-mathematics"

import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
} from "@/components/tiptap-ui/color-highlight-popover"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

import { EquationPopover } from "@/components/tiptap-ui/equation-popover/equation-popover"

import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

import "@/components/tiptap-templates/simple/simple-editor.scss"
import "@/components/tiptap-templates/simple/question-editor.scss"

interface QuestionEditorProps {
  value: string
  onChange: (html: string) => void
}

export function QuestionEditor({ value, onChange }: QuestionEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
        inlineOptions: {
          onClick: (node, pos) => {
            const latex = prompt("Edit equation:", node.attrs.latex)
            if (latex !== null) {
              editor?.chain().setNodeSelection(pos).updateInlineMath({ latex }).focus().run()
            }
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            const latex = prompt("Edit equation:", node.attrs.latex)
            if (latex !== null) {
              editor?.chain().setNodeSelection(pos).updateBlockMath({ latex }).focus().run()
            }
          },
        },
      }),
    ],
    content: value || "<p></p>",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: 0,
  })

  if (!editor) return null

  return (
    <div className="simple-editor-wrapper question-editor-form">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          <Spacer />

          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
            <ListDropdownMenu
              modal={false}
              types={["bulletList", "orderedList", "taskList"]}
            />
            <BlockquoteButton />
            <CodeBlockButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            {!isMobile ? <ColorHighlightPopover /> : null}
            {!isMobile ? <LinkPopover /> : null}
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <EquationPopover
              onInsert={(latex) => {
                editor.chain().focus().insertInlineMath({ latex }).run()
              }}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>

          <Spacer />
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
