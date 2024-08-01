import * as v from 'valibot';
import { DEFAULT_OPTIONS } from './constants';

/**
 * The schema for the parsed command line arguments
 */
export const ParsedArgumentsSchema = v.object({
  /**
   * The input text to transform
   */
  _: v.transform(
    v.array(v.string([v.toTrimmed(), v.minLength(1, 'the string to transform cannot be empty')]), [
      v.maxLength(1, 'only one string is allowed'),
    ]),
    (s) => (s.length > 0 ? s[0] : null),
  ),

  /**
   * Whether to convert the slug to lowercase
   */
  lower: v.optional(v.boolean(), DEFAULT_OPTIONS.lower),

  /**
   * The replacement character for disallowed characters
   */
  replacement: v.optional(v.string(), DEFAULT_OPTIONS.replacement),

  /**
   * Whether to show the help message
   */
  help: v.optional(v.boolean(), false),

  /**
   * Whether to show the version
   */
  version: v.optional(v.boolean(), false),
});

/**
 * The parsed command line arguments
 */
export type ParsedArguments = v.Output<typeof ParsedArgumentsSchema>;

/**
 * The options that can be passed to the transform function
 */
export type TransformOptions = Pick<ParsedArguments, 'replacement' | 'lower'>;

/**
 * The function that transforms a string into a slug
 */
export type SlugMethod = (inputText: string, options: TransformOptions) => string;

/**
 * The success result schema of the cli argument parsing and transformation
 */
export const SuccessResultSchema = v.object(
  {
    /**
     * Whether the transformation was successful
     */
    success: v.literal(true),

    /**
     * The slug output
     */
    output: v.string(),
  },
  v.never(), // dont allow extra properties
);

/**
 * The success result of the cli argument parsing and transformation
 */
export type SuccessResult = v.Output<typeof SuccessResultSchema>;

/**
 * The error result schema of the cli argument parsing and transformation
 */
export const ErrorResultSchema = v.object(
  {
    /**
     * Whether the transformation was successful
     */
    success: v.literal(false),

    /**
     * The error that occurred
     */
    error: v.instance(Error),
  },
  v.never(), // dont allow extra properties
);

/**
 * The error result of the cli argument parsing and transformation
 */
export type ErrorResult = v.Output<typeof ErrorResultSchema>;

/**
 * The result of the cli argument parsing and transformation
 */
export type Result = SuccessResult | ErrorResult;
