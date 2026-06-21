<template>
  <Teleport to="body">
    <div v-if="modelValue" class="vue-dialog-overlay" @click="handleOverlayClick">
      <div class="vue-dialog" :style="dialogStyle" @click.stop>
        <div class="vue-dialog-header">
          <h3 v-if="title">{{ title }}</h3>
          <button v-if="showClose" @click="close" class="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="vue-dialog-content">
          <slot>{{ content }}</slot>
        </div>
        <div v-if="$slots.actions || showDefaultActions" class="vue-dialog-footer">
          <slot name="actions">
            <button @click="close" class="btn btn-primary">{{ okText }}</button>
            <button v-if="showCancel" @click="cancel" class="btn btn-secondary">{{ cancelText }}</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'VueDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '400px'
    },
    showClose: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    showDefaultActions: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: false
    },
    okText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    }
  },
  emits: ['update:modelValue', 'close', 'cancel'],
  computed: {
    dialogStyle() {
      return {
        width: this.width,
        maxWidth: '90vw'
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },
    cancel() {
      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.vue-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.vue-dialog {
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideIn 0.3s ease-out;
}

.vue-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #eee);
}

.vue-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color, #333);
}

.vue-dialog-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.vue-dialog-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color, #eee);
  text-align: right;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color, #666);
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-color, #333);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--primary-color, #257aa7);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark, #1e628a);
}

.btn-secondary {
  background: var(--secondary-color, #6c757d);
  color: white;
}

.btn-secondary:hover {
  background: var(--secondary-color-dark, #5a6268);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
