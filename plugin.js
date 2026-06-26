import { classifyBlockedCommand, buildBlockMessage } from './src/blocker.js';

function extractCommand(input, output) {
  return (
    output?.args?.command ??
    input?.command ??
    input?.args?.command ??
    ''
  );
}

export const PixiPythonBlockPlugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input?.tool !== 'bash') return;

      const command = extractCommand(input, output);
      const match = classifyBlockedCommand(command);
      if (!match.blocked) return;

      throw new Error(buildBlockMessage(match));
    },
  };
};

export default PixiPythonBlockPlugin;
