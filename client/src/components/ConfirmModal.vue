<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-overlay" @click.self="cancel">
            <div class="modal-content">
                <div class="modal-icon-wrapper">
                    <slot name="icon">
                        <PhTrash :size="32" weight="duotone" color="#ef4444" />
                    </slot>
                </div>
                <h3>{{ title }}</h3>
                <p>{{ message }}</p>
                <div class="modal-actions-row">
                    <button class="btn-cancel" @click="cancel">{{ cancelText }}</button>
                    <button class="btn-danger" @click="confirm">{{ confirmText }}</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { PhTrash } from '@phosphor-icons/vue';

interface Props {
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

withDefaults(defineProps<Props>(), {
    title: 'Excluir Item?',
    message: 'Esta ação é permanente e não poderá ser desfeita. Deseja continuar?',
    confirmText: 'Sim, Excluir',
    cancelText: 'Cancelar'
});

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

const confirm = () => {
    emit('confirm');
};

const cancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: var(--bg-card, #1a1a1a);
    padding: 2.5rem 2rem;
    border-radius: 1.5rem;
    border: 1px solid rgba(239, 68, 68, 0.3);
    max-width: 420px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: bounceIn 0.3s ease-out;
}

.modal-icon-wrapper {
    background: rgba(239, 68, 68, 0.1);
    width: 64px; height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
}

.modal-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #ffffff);
}

.modal-content p {
    color: var(--text-secondary, #a1a1aa);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 2rem;
}

.modal-actions-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-cancel {
    background-color: transparent;
    border: none;
    color: var(--text-secondary, #a1a1aa);
    padding: 0.75rem 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel:hover {
    color: var(--text-primary, #ffffff);
}

.btn-danger {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-danger:hover {
    background: #dc2626;
}

@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
</style>
