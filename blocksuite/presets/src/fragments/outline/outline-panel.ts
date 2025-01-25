import {
  PropTypes,
  requiredProperties,
  ShadowlessElement,
} from '@blocksuite/block-std';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/utils';
import { provide } from '@lit/context';
import { effect, signal } from '@preact/signals-core';
import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import type { AffineEditorContainer } from '../../editors/editor-container.js';
import { outlineSettingsKey, type TocContext, tocContext } from './config.js';
import * as styles from './outline-panel.css';

export const AFFINE_OUTLINE_PANEL = 'affine-outline-panel';

@requiredProperties({
  editor: PropTypes.object,
})
export class OutlinePanel extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  private _setContext() {
    this._context = {
      editor$: signal(this.editor),
      showIcons$: signal<boolean>(false),
      enableSorting$: signal<boolean>(false),
      fitPadding$: signal<number[]>(this.fitPadding),
    };

    this.disposables.add(
      effect(() => {
        const settingsString = localStorage.getItem(outlineSettingsKey);
        const settings = settingsString ? JSON.parse(settingsString) : null;

        if (settings) {
          this._context.showIcons$.value = settings.showIcons;
        }

        const editor = this._context.editor$.value;
        if (editor.mode === 'edgeless') {
          this._context.enableSorting$.value = true;
        } else if (settings) {
          this._context.enableSorting$.value = settings.enableSorting;
        }
      })
    );
  }

  private _watchSettingsChange() {
    this.disposables.add(
      effect(() => {
        if (this._context.editor$.value.mode === 'edgeless') return;

        const showPreviewIcon = this._context.showIcons$.value;
        const enableNotesSorting = this._context.enableSorting$.value;
        localStorage.setItem(
          outlineSettingsKey,
          JSON.stringify({
            showIcons: showPreviewIcon,
            enableSorting: enableNotesSorting,
          })
        );
      })
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(styles.outlinePanel);

    this._setContext();
    this._watchSettingsChange();
  }

  override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('editor')) {
      this._context.editor$.value = this.editor;
    }
    if (changedProperties.has('fitPadding')) {
      this._context.fitPadding$.value = this.fitPadding;
    }
  }

  override render() {
    if (!this.editor.host) return;

    return html`
      <affine-outline-panel-header></affine-outline-panel-header>
      <affine-outline-panel-body> </affine-outline-panel-body>
      <affine-outline-notice></affine-outline-notice>
    `;
  }

  @provide({ context: tocContext })
  private accessor _context!: TocContext;

  @property({ attribute: false })
  accessor editor!: AffineEditorContainer;

  @property({ attribute: false })
  accessor fitPadding!: number[];
}

declare global {
  interface HTMLElementTagNameMap {
    [AFFINE_OUTLINE_PANEL]: OutlinePanel;
  }
}
