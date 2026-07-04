import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Modal dialog generik. Dibuat manual di atas `Card` dari astryxdesign
 * (bukan pakai komponen Modal/Dialog bawaan library, yang belum terverifikasi
 * tersedia) supaya tetap konsisten secara visual dengan tema aplikasi.
 */
export function Modal({ title, onClose, children, width = 440 }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "var(--color-overlay, rgba(0,0,0,0.5))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
            }}
            onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: `min(${width}px, 100%)` }}>
                <Card padding={6} width="100%">
                    <VStack gap={4} hAlign="stretch">
                        <HStack style={{ justifyContent: "space-between" }} vAlign="center">
                            <Text type="display-1" as="h2">
                                {title}
                            </Text>
                            <button
                                onClick={onClose}
                                aria-label="Tutup"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4,
                                    color: "var(--color-text-secondary)",
                                    display: "flex",
                                }}>
                                <XMarkIcon style={{ width: 20, height: 20 }} />
                            </button>
                        </HStack>
                        {children}
                    </VStack>
                </Card>
            </div>
        </div>
    );
}
