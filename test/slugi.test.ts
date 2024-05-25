import { describe, beforeEach, it, expect, vi } from 'vitest';
import * as v from 'valibot';
import { Slugi } from '../src/slugi';
import { ErrorResultSchema, SuccessResultSchema, ParsedArgumentsSchema } from '../src/types';
import { version } from '../package.json';

describe('Slugi', () => {
  const defaultOptions = v.parse(ParsedArgumentsSchema, { _: [] }); // default options
  let slugi: Slugi;

  beforeEach(() => {
    slugi = new Slugi(defaultOptions, vi.fn());
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes default options', () => {
      const options1 = { replacement: '0', lower: true };
      expect(new Slugi(options1, vi.fn()).defaultOptions).toEqual(options1);
      const options2 = { replacement: 'a', lower: false };
      expect(new Slugi(options2, vi.fn()).defaultOptions).toEqual(options2);
    });
  });

  describe('generateHelpMessage', () => {
    it('generates help message', () => {
      const message = 'Some custom message';
      const helpMessage = slugi.generateHelpMessage(message);
      expect(helpMessage).toMatch(message);
      expect(helpMessage).toMatch(slugi.helpMessage);
      expect(helpMessage).toMatch(/--help/i);
    });

    it('displays correct default options', () => {
      const options = [
        { replacement: '0', lower: true },
        { replacement: '1', lower: false },
      ];
      for (const option of options) {
        const slugi = new Slugi(option, vi.fn());
        const helpMessage = slugi.generateHelpMessage('');
        const replacementRegex = new RegExp(
          `--replacement.*\\[default: "${slugi.defaultOptions.replacement}"\\]`,
        );
        const lowercaseRegex = new RegExp(
          `--lowercase.*\\[default: ${slugi.defaultOptions.lower}\\]`,
        );
        expect(helpMessage).toMatch(replacementRegex);
        expect(helpMessage).toMatch(lowercaseRegex);
      }
    });

    it('lists all options', () => {
      const helpMessage = slugi.generateHelpMessage('');
      expect(helpMessage).toMatch(/-r, --replacement/i);
      expect(helpMessage).toMatch(/-l, --lowercase/i);
      expect(helpMessage).toMatch(/-h, --help/i);
      expect(helpMessage).toMatch(/-v, --version/i);
    });
  });

  describe('parseArguments', () => {
    it('uses default options', () => {
      const argv = ['node', 'index.js', 'hello world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({ ...defaultOptions, _: 'hello world' });
    });

    it('-r, --replacement', () => {
      const argv1 = ['node', 'index.js', '-r', '0', 'hello world'];
      const parsedArgs1 = slugi.parseArguments(argv1);
      expect(parsedArgs1).toEqual({
        ...defaultOptions,
        replacement: '0',
        _: 'hello world',
      });

      const argv2 = ['node', 'index.js', '--replacement', '0', 'hello world'];
      const parsedArgs2 = slugi.parseArguments(argv2);
      expect(parsedArgs2).toEqual({
        ...defaultOptions,
        replacement: '0',
        _: 'hello world',
      });
    });

    it('-l, --lowercase', () => {
      const argv1 = ['node', 'index.js', '-l', 'HELLO world'];
      const parsedArgs1 = slugi.parseArguments(argv1);
      expect(parsedArgs1).toEqual({
        ...defaultOptions,
        lower: true,
        _: 'HELLO world',
      });

      const argv2 = ['node', 'index.js', '--lowercase', 'HELLO world'];
      const parsedArgs2 = slugi.parseArguments(argv2);
      expect(parsedArgs2).toEqual({
        ...defaultOptions,
        lower: true,
        _: 'HELLO world',
      });
    });

    it('-h, --help', () => {
      const argv1 = ['node', 'index.js', '-h'];
      const parsedArgs1 = slugi.parseArguments(argv1);
      expect(parsedArgs1).toEqual({ ...defaultOptions, help: true });

      const argv2 = ['node', 'index.js', '--help'];
      const parsedArgs2 = slugi.parseArguments(argv2);
      expect(parsedArgs2).toEqual({ ...defaultOptions, help: true });
    });

    it('-v, --version', () => {
      const argv1 = ['node', 'index.js', '-v'];
      const parsedArgs1 = slugi.parseArguments(argv1);
      expect(parsedArgs1).toEqual({ ...defaultOptions, version: true });

      const argv2 = ['node', 'index.js', '--version'];
      const parsedArgs2 = slugi.parseArguments(argv2);
      expect(parsedArgs2).toEqual({ ...defaultOptions, version: true });
    });

    it('handles multiple arguments', () => {
      const argv = ['node', 'index.js', '-r', '0', '-l', 'HELLO world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({
        ...defaultOptions,
        replacement: '0',
        lower: true,
        _: 'HELLO world',
      });
    });

    it('throws an error when an invalid option is passed', () => {
      const argv = ['node', 'index.js', '-x', 'hello world'];
      expect(() => slugi.parseArguments(argv)).toThrow(/-x/);
    });

    it('throws an error when an option is missing a value', () => {
      const argv = ['node', 'index.js', '-r'];
      expect(() => slugi.parseArguments(argv)).toThrow(/-r/);
    });

    it('throws an error when too many arguments are passed', () => {
      const argv = ['node', 'index.js', 'hello', 'world'];
      expect(() => slugi.parseArguments(argv)).toThrow(v.ValiError);
    });

    it('throws an error when an empty string is passed', () => {
      expect(() => slugi.parseArguments(['node', 'index.js', ''])).toThrow(v.ValiError);
      expect(() => slugi.parseArguments(['node', 'index.js', '       '])).toThrow(v.ValiError);
    });

    it('accepts empty replacement', () => {
      const argv = ['node', 'index.js', '-r', '', 'hello world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({ ...defaultOptions, replacement: '', _: 'hello world' });
    });

    it('accepts whitespace as replacement', () => {
      const argv = ['node', 'index.js', '-r', '   ', 'hello world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({ ...defaultOptions, replacement: '   ', _: 'hello world' });
    });

    it('uses last argument when provided multiple times', () => {
      const argv = ['node', 'index.js', '-r', '0', '-r', '1', 'hello world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({ ...defaultOptions, replacement: '1', _: 'hello world' });
    });

    it('works with long argument values', () => {
      const argv = ['node', 'index.js', '-r', 'a'.repeat(500), 'hello world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({
        ...defaultOptions,
        replacement: 'a'.repeat(500),
        _: 'hello world',
      });
    });

    it('accepts chained short options', () => {
      const argv = ['node', 'index.js', '-lr', '0', 'HELLO world'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({
        ...defaultOptions,
        lower: true,
        replacement: '0',
        _: 'HELLO world',
      });
    });

    it('accepts arguments in any order', () => {
      const argv = ['node', 'index.js', '-r', '0', 'HELLO world', '-l'];
      const parsedArgs = slugi.parseArguments(argv);
      expect(parsedArgs).toEqual({
        ...defaultOptions,
        lower: true,
        replacement: '0',
        _: 'HELLO world',
      });
    });
  });

  describe('getSlugFromArguments', () => {
    it('calls the slug method with parsed arguments', () => {
      const slugMethod = vi.fn();
      const options = { replacement: '0', lower: false };
      const args = ['node', 'index.js', '-r', '1', '-l', 'HELLO world'];
      const slugi = new Slugi(options, slugMethod);
      const parsedArguments = slugi.parseArguments(args);
      slugi.getSlugFromArguments(args);
      expect(slugMethod).toHaveBeenCalledTimes(1);
      expect(slugMethod).toHaveBeenCalledWith(parsedArguments._, {
        replacement: parsedArguments.replacement,
        lower: parsedArguments.lower,
      });
    });

    it('returns transformed string', () => {
      const result = new Slugi(
        { replacement: '-', lower: false },
        () => 'mock-value',
      ).getSlugFromArguments(['node', 'index.js', 'HELLO world']);
      const parsed = v.parse(SuccessResultSchema, result);
      expect(parsed.output).toBe('mock-value');
    });

    it('defaults to constructor value when no options are provided', () => {
      const options = [
        { replacement: '0', lower: true },
        { replacement: '1', lower: false },
      ];
      for (const option of options) {
        const slugMethod = vi.fn();
        const slugi = new Slugi(option, slugMethod);
        slugi.getSlugFromArguments(['node', 'index.js', 'HELLO world']);
        expect(slugMethod).toHaveBeenCalledTimes(1);
        expect(slugMethod).toHaveBeenCalledWith('HELLO world', option);
      }
    });

    describe('returns error result when', () => {
      it.each([
        {
          description: 'no arguments are provided',
          argv: [],
          calledWith: expect.any(String),
        },
        {
          description: 'an invalid option is passed',
          argv: ['-x', 'hello world'],
          calledWith: expect.stringMatching(/-x/),
        },
        {
          description: 'an option is missing a value',
          argv: ['-r'],
          calledWith: expect.stringMatching(/-r/),
        },
        {
          description: 'too many arguments are passed',
          argv: ['hello', 'world'],
          calledWith: expect.any(String),
        },
        {
          description: 'an empty string is passed',
          argv: [''],
          calledWith: expect.any(String),
        },
        {
          description: 'an empty string with whitespace is passed',
          argv: ['       '],
          calledWith: expect.any(String),
        },
      ])('$description', ({ argv, calledWith }) => {
        const spy = vi.spyOn(slugi, 'generateHelpMessage');
        const result = slugi.getSlugFromArguments(['node', 'index.js', ...argv]);
        const parsed = v.parse(ErrorResultSchema, result);
        expect(parsed.error.message).toMatch(slugi.helpMessage);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(calledWith);
      });
    });

    describe('help and version', () => {
      const slugi = new Slugi(defaultOptions, vi.fn());
      const testCases = [
        {
          description: 'help',
          options: [
            { description: 'short option (-h)', command: ['-h'] },
            { description: 'long option (--help)', command: ['--help'] },
            {
              description: 'is always displayed when other valid arguments are present',
              command: ['--lowercase', 'hello world', '-r', '0', '-h', '-v'],
            },
          ],
          expectedOutput: slugi.helpMessage,
        },
        {
          description: 'version',
          options: [
            { description: 'short option (-v)', command: ['-v'] },
            { description: 'long option (--version)', command: ['--version'] },
            {
              description: 'is always displayed when arguments other than version are present',
              command: ['--lowercase', 'hello world', '-r', '0', '-v'],
            },
          ],
          expectedOutput: version,
        },
      ];

      testCases.forEach(({ description, options, expectedOutput }) => {
        describe(description, () => {
          options.forEach(({ description, command }) => {
            it(`${description}`, async () => {
              const result = slugi.getSlugFromArguments(['node', 'index.js', ...command]);
              const parsed = v.parse(SuccessResultSchema, result);
              expect(parsed.output).toEqual(expectedOutput);
            });
          });
        });
      });
    });
  });
});
