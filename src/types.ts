import * as v from 'valibot';
import { DEFAULT_OPTIONS } from './constants';

export const ParsedArgumentsSchema = v.object({
  _: v.transform(
    v.array(v.string([v.toTrimmed(), v.minLength(1, 'the string to transform cannot be empty')]), [
      v.maxLength(1, 'only one string is allowed'),
    ]),
    (s) => (s.length > 0 ? s[0] : null),
  ),
  lower: v.optional(v.boolean(), DEFAULT_OPTIONS.lower),
  replacement: v.optional(v.string(), DEFAULT_OPTIONS.replacement),
  help: v.optional(v.boolean(), false),
  version: v.optional(v.boolean(), false),
});
export type ParsedArguments = v.Output<typeof ParsedArgumentsSchema>;

export type TransformOptions = Pick<ParsedArguments, 'replacement' | 'lower'>;

export type SlugMethod = (inputText: string, options: TransformOptions) => string;

export const SuccessResultSchema = v.object(
  {
    success: v.literal(true),
    output: v.string(),
  },
  v.never(), // dont allow extra properties
);
export type SuccessResult = v.Output<typeof SuccessResultSchema>;

export const ErrorResultSchema = v.object(
  {
    success: v.literal(false),
    error: v.instance(Error),
  },
  v.never(), // dont allow extra properties
);
export type ErrorResult = v.Output<typeof ErrorResultSchema>;

export type Result = SuccessResult | ErrorResult;
