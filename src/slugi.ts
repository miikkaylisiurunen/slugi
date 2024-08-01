import arg from 'arg';
import * as v from 'valibot';
import pc from 'picocolors';
import { version } from '../package.json';
import {
  ParsedArguments,
  ParsedArgumentsSchema,
  Result,
  SlugMethod,
  TransformOptions,
} from './types';

/**
 * A class for generating slugs from the command line
 */
export class Slugi {
  /**
   * Default options for the slug transformation
   */
  defaultOptions: TransformOptions;
  /**
   * The method used to generate slugs from strings
   */
  slugMethod: SlugMethod;
  /**
   * The help message for the CLI
   */
  get helpMessage() {
    return `Usage: slugi <string> [options]

Transform a string into a slug

Positionals:
    string              The string to transform  [string]  [required]

Options:
    -r, --replacement   Replacement for spaces   [string]  [default: "${this.defaultOptions.replacement}"]
    -l, --lowercase     Output in lowercase      [boolean] [default: ${this.defaultOptions.lower}]
    -h, --help          Show help                [boolean]
    -v, --version       Show version number      [boolean]`;
  }

  /**
   * Create a new instance of Slugi
   *
   * @param defaultOptions - The default options for the slug transformation
   * @param slugMethod - The method used to generate slugs from strings
   */
  constructor(defaultOptions: TransformOptions, slugMethod: SlugMethod) {
    this.defaultOptions = defaultOptions;
    this.slugMethod = slugMethod;
  }

  /**
   * Generate a help message with the provided message appended
   *
   * @param message - The message to append to the help message
   * @returns The generated help message
   */
  generateHelpMessage(message: string) {
    return `${this.helpMessage}

${pc.bgRed(' ERROR ')} ${pc.red(message)}`;
  }

  /**
   * Parses the command line arguments and returns an object with the parsed values.
   *
   * @param argv - The command line arguments to parse.
   * @returns An object with the parsed argument values.
   */
  parseArguments(argv: string[]): ParsedArguments {
    const args = arg(
      {
        '--version': Boolean,
        '-v': '--version',

        '--help': Boolean,
        '-h': '--help',

        '--lowercase': Boolean,
        '-l': '--lowercase',

        '--replacement': String,
        '-r': '--replacement',
      },
      {
        argv: argv.slice(2),
      },
    );

    const parsedArguments = v.parse(ParsedArgumentsSchema, {
      _: args._,
      lower: args['--lowercase'] ?? this.defaultOptions.lower,
      replacement: args['--replacement'] ?? this.defaultOptions.replacement,
      help: args['--help'],
      version: args['--version'],
    });

    return parsedArguments;
  }

  /**
   * Get the slug from the command line arguments
   *
   * @param argv - The command line arguments to parse
   * @returns The result of the slug transformation
   */
  getSlugFromArguments(argv: string[]): Result {
    try {
      const options = this.parseArguments(argv);
      if (options.help) {
        return {
          success: true,
          output: this.helpMessage,
        };
      } else if (options.version) {
        return {
          success: true,
          output: version,
        };
      } else if (!options._) {
        throw new Error(this.generateHelpMessage('please provide the string to transform'));
      }
      const slug = this.slugMethod(options._, {
        lower: options.lower,
        replacement: options.replacement,
      });
      return {
        success: true,
        output: slug,
      };
    } catch (error) {
      let err = new Error('Something went wrong!');
      if (error instanceof arg.ArgError) {
        err = new Error(this.generateHelpMessage(error.message));
      } else if (error instanceof v.ValiError) {
        err = new Error(this.generateHelpMessage(error.message));
      } else if (error instanceof Error) {
        err = error;
      }
      return {
        success: false,
        error: err,
      };
    }
  }
}
