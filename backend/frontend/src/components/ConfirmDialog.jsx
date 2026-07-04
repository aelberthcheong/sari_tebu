import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";

import { Modal } from "#/components/Modal.jsx";

export function ConfirmDialog({
    title,
    description,
    confirmLabel = "Konfirmasi",
    isDangerous = true,
    isLoading = false,
    onConfirm,
    onClose,
}) {
    return (
        <Modal title={title} onClose={onClose} width={400}>
            <VStack gap={5} hAlign="stretch">
                <Text type="body" color="secondary">
                    {description}
                </Text>
                <VStack gap={2} hAlign="stretch">
                    <div
                        style={
                            isDangerous
                                ? {
                                      "--color-accent": "var(--color-error, #a50c25)",
                                  }
                                : undefined
                        }>
                        <Button
                            label={confirmLabel}
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            onClick={onConfirm}
                        />
                    </div>
                    <Button
                        label="Batal"
                        variant="secondary"
                        size="lg"
                        disabled={isLoading}
                        onClick={onClose}
                    />
                </VStack>
            </VStack>
        </Modal>
    );
}
