import type { ExtensionType } from '@blocksuite/store';

import { CommandIdentifier } from '../identifier.js';
import type { BlockCommands } from '../spec/index.js';

/**
 * Create a command extension.
 *
 * @param commands A map of command names to command implementations.
 *
 * @example
 * ```ts
 * import { CommandExtension } from '@blocksuite/block-std';
 *
 * const MyCommandExtension = CommandExtension({
 *   'my-command': MyCommand
 * });
 * ```
 */
export function CommandExtension(commands: BlockCommands): ExtensionType {
  return {
    setup: di => {
      Object.entries(commands).forEach(([name, command]) => {
        di.addImpl(CommandIdentifier(name), () => command);
      });
    },
  };
}
