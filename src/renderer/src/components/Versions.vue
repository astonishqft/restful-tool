<script setup lang="ts">
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <ul class="versions">
    <li class="electron-version">
      <span class="version-icon">⚡</span>
      <span class="version-text">Electron v{{ versions.electron }}</span>
    </li>
    <li class="chrome-version">
      <span class="version-icon">🌐</span>
      <span class="version-text">Chromium v{{ versions.chrome }}</span>
    </li>
    <li class="node-version">
      <span class="version-icon">🟢</span>
      <span class="version-text">Node v{{ versions.node }}</span>
    </li>
  </ul>
</template>

<style scoped lang="less">
.versions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  li {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
    border: 1px solid var(--border-color-extra-light);
    border-radius: var(--border-radius-base);
    box-shadow: var(--box-shadow-light);
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--box-shadow-base);
      background: linear-gradient(135deg, var(--bg-color), var(--bg-color-light));
    }
    
    .version-icon {
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .version-text {
      color: var(--text-color-primary);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      flex: 1;
    }
    
    &.electron-version {
      border-left: 4px solid var(--primary-color);
      
      .version-icon {
        color: var(--primary-color);
      }
    }
    
    &.chrome-version {
      border-left: 4px solid var(--success-color);
      
      .version-icon {
        color: var(--success-color);
      }
    }
    
    &.node-version {
      border-left: 4px solid var(--warning-color);
      
      .version-icon {
        color: var(--warning-color);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .versions {
    li {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 12px;
      
      .version-icon {
        font-size: 16px;
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
