"use client"

import { useEditor, EditorContent, EditorContext } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Mathematics } from "@tiptap/extension-mathematics"

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { EquationPopover } from "@/components/tiptap-ui/equation-popover/equation-popover"

import "@/components/tiptap-templates/simple/simple-editor.scss"
import "@/components/tiptap-templates/simple/answer-editor.scss"

interface AnswerEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function AnswerEditor({ value, onChange, placeholder }: AnswerEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": placeholder || "Answer choice content area",
        class: "simple-editor answer-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: false,
      }),
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

  if (!editor) return null

  return (
    <div className="simple-editor-wrapper answer-editor-form border rounded-md overflow-hidden bg-background">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar className="py-1 px-2 gap-1 min-h-0 bg-muted/20 border-b flex flex-wrap items-center">
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
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
