import {
  CaptionedBlockComponent,
  SelectedStyle,
} from '@blocksuite/affine-components/caption';
import type { EmbedCardStyle } from '@blocksuite/affine-model';
import {
  EMBED_CARD_HEIGHT,
  EMBED_CARD_MIN_WIDTH,
  EMBED_CARD_WIDTH,
} from '@blocksuite/affine-shared/consts';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { BlockSelection, type BlockService } from '@blocksuite/block-std';
import type { GfxCompatibleProps } from '@blocksuite/block-std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';

export class EmbedBlockComponent<
  Model extends BlockModel<GfxCompatibleProps> = BlockModel<GfxCompatibleProps>,
  Service extends BlockService = BlockService,
  WidgetName extends string = string,
> extends CaptionedBlockComponent<Model, Service, WidgetName> {
  private _fetchAbortController = new AbortController();

  _cardStyle: EmbedCardStyle = 'horizontal';

  /**
   * The actual rendered scale of the embed card.
   * By default, it is set to 1.
   */
  protected _scale = 1;

  blockDraggable = true;

  /**
   * The style of the embed card.
   * You can use this to change the height and width of the card.
   * By default, the height and width are set to `_cardHeight` and `_cardWidth` respectively.
   */
  protected embedContainerStyle: StyleInfo = {};

  renderEmbed = (content: () => TemplateResult) => {
    if (
      this._cardStyle === 'horizontal' ||
      this._cardStyle === 'horizontalThin' ||
      this._cardStyle === 'list'
    ) {
      this.style.display = 'block';

      const mode = this.std.get(DocModeProvider).getEditorMode();
      if (mode === 'edgeless') {
        this.style.minWidth = `${EMBED_CARD_MIN_WIDTH}px`;
      }
    }

    const selected = !!this.selected?.is(BlockSelection);
    return html`
      <div
        draggable="${this.blockDraggable ? 'true' : 'false'}"
        class=${classMap({
          'embed-block-container': true,
          'selected-style': selected,
        })}
        style=${styleMap({
          height: `${this._cardHeight}px`,
          width: '100%',
          ...this.embedContainerStyle,
        })}
      >
        ${content()}
      </div>
    `;
  };

  /**
   * The height of the current embed card. Changes based on the card style.
   */
  get _cardHeight() {
    return EMBED_CARD_HEIGHT[this._cardStyle];
  }

  /**
   * The width of the current embed card. Changes based on the card style.
   */
  get _cardWidth() {
    return EMBED_CARD_WIDTH[this._cardStyle];
  }

  get fetchAbortController() {
    return this._fetchAbortController;
  }

  override connectedCallback() {
    super.connectedCallback();

    if (this._fetchAbortController.signal.aborted)
      this._fetchAbortController = new AbortController();

    this.contentEditable = 'false';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._fetchAbortController.abort();
  }

  protected override accessor blockContainerStyles: StyleInfo | undefined = {
    margin: '18px 0',
  };

  @query('.embed-block-container')
  protected accessor embedBlock!: HTMLDivElement;

  override accessor selectedStyle = SelectedStyle.Border;

  override accessor useCaptionEditor = true;

  override accessor useZeroWidth = true;
}
