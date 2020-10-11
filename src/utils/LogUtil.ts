export class LogInput {
    requestId: number;
    functionName: string;
    message: string;
}

export const createLogMessage = (input: LogInput): string => {
    return `${new Date().toISOString()} [${input.requestId}] ${input.functionName} | ${input.message}`;
  }