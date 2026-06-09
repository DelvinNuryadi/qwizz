"use client";

import { useCallback, useState } from "react";
import katex from "katex";

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Input } from "@/components/tiptap-ui-primitive/input";
import {
    Card,
    CardBody,
    CardFooter,
    CardGroupLabel,
} from "@/components/tiptap-ui-primitive/card";
import { Sigma } from "lucide-react";

interface EquationPopoverProps {
    onInsert: (latex: string) => void;
    initialLatex?: string;
    mode?: "insert" | "edit";
}

export function EquationPopover({
    onInsert,
    initialLatex = "",
    mode = "insert",
}: EquationPopoverProps) {
    const [open, setOpen] = useState(false);
    const [latex, setLatex] = useState(initialLatex);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleChange(value: string) {
        setLatex(value);
        if (!value.trim()) {
            setPreviewHtml(null);
            setError(null);
            return;
        }
        try {
            const html = katex.renderToString(value, {
                throwOnError: true,
                displayMode: false,
            });
            setPreviewHtml(html);
            setError(null);
        } catch (err) {
            setPreviewHtml(null);
            setError(err instanceof Error ? err.message : "Invalid LaTeX");
        }
    }

    const handleInsert = useCallback(() => {
        if (latex.trim()) {
            onInsert(latex.trim());
            setLatex("");
            setPreviewHtml(null);
            setError(null);
            setOpen(false);
        }
    }, [latex, onInsert]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleInsert();
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        },
        [handleInsert],
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    tooltip={
                        mode === "edit" ? "Edit equation" : "Insert equation"
                    }
                    data-active-state={open ? "on" : "off"}
                >
                    <Sigma className="tiptap-button-icon" />
                </Button>
            </PopoverTrigger>
            <PopoverContent aria-label="Equation editor" align="start">
                <Card style={{ width: "320px" }}>
                    <CardBody>
                        <CardGroupLabel>
                            {mode === "edit"
                                ? "Edit equation"
                                : "Insert equation"}
                        </CardGroupLabel>
                        <div style={{ marginTop: "8px" }}>
                            <Input
                                type="text"
                                placeholder="\sqrt{x^2 + y^2}"
                                value={latex}
                                onChange={(e) => handleChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>
                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "11px",
                                color: "var(--tt-gray-light-a-500)",
                            }}
                        >
                            Masukkan persamaan dalam format LaTeX
                        </div>
                        {previewHtml && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    padding: "8px",
                                    borderRadius: "6px",
                                    background: "var(--tt-gray-light-a-50)",
                                    border: "1px solid var(--tt-border-color)",
                                    fontSize: "14px",
                                    textAlign: "center",
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: previewHtml,
                                }}
                            />
                        )}
                        {error && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    fontSize: "12px",
                                    color: "var(--tt-color-red-base)",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </CardBody>
                    <CardFooter
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: "4px",
                            marginBottom: "4px",
                        }}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="small"
                            disabled={!latex.trim() || !!error}
                            onClick={handleInsert}
                        >
                            {mode === "edit" ? "Update" : "Insert"}
                        </Button>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
