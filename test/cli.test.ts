import { describe, it, expect, beforeAll, vi } from 'vitest';
import { execa, execaNode } from 'execa';
import path from 'path';
import { version, bin } from '../package.json';
import { Slugi } from '../src/slugi'; // imported to automatically rerun tests when this file changes
import { DEFAULT_OPTIONS } from '../src/constants';

const binaryPath = path.resolve(__dirname, `../${bin.slugi}`);

// build the project before running tests to ensure the binary is up-to-date
beforeAll(async () => {
  await execa('npm', ['run', 'build']);
});

describe('CLI', () => {
  describe('arguments', () => {
    describe('replacement (-r)', () => {
      it('short option', async () => {
        await assertSuccessfulRun(['-r', '0', 'hello world'], 'hello0world');
      });

      it('long option', async () => {
        await assertSuccessfulRun(['--replacement', '0', 'hello world'], 'hello0world');
        await assertSuccessfulRun(['--replacement=0', 'hello world'], 'hello0world');
      });
    });

    describe('lower (-l)', () => {
      it('short option', async () => {
        await assertSuccessfulRun(
          ['-l', 'HELLO world'],
          `hello${DEFAULT_OPTIONS.replacement}world`,
        );
      });

      it('long option', async () => {
        await assertSuccessfulRun(
          ['--lowercase', 'HELLO world'],
          `hello${DEFAULT_OPTIONS.replacement}world`,
        );
      });
    });

    describe('combination', () => {
      it('both options', async () => {
        await assertSuccessfulRun(['-r', '0', '-l', 'HELLO world'], 'hello0world');
      });
    });

    describe('help (-h)', () => {
      const slugi = new Slugi(DEFAULT_OPTIONS, vi.fn());
      it('short option', async () => {
        await assertSuccessfulRun(['-h'], slugi.helpMessage);
      });

      it('long option', async () => {
        await assertSuccessfulRun(['--help'], slugi.helpMessage);
      });
    });

    describe('version (-v)', () => {
      it('short option', async () => {
        await assertSuccessfulRun(['-v'], version);
      });

      it('long option', async () => {
        await assertSuccessfulRun(['--version'], version);
      });
    });
  });

  describe('display help and exit', () => {
    it.each([
      {
        description: 'no arguments are provided',
        argv: [],
        expectedError: /please provide the string to transform/i,
      },
      {
        description: 'no string is provided',
        argv: ['-r', 'a', '-l'],
        expectedError: /please provide the string to transform/i,
      },
      {
        description: 'more than one string is provided',
        argv: ['abc1', 'abc2'],
        expectedError: /only one string is allowed/i,
      },
      {
        description: 'an unknown option is provided',
        argv: ['-z', 'a', 'hello world'],
        expectedError: /unknown or unexpected option/i,
      },
      {
        description: 'empty string is provided',
        argv: [''],
        expectedError: /empty/i,
      },
      {
        description: 'empty string is provided',
        argv: ['        '],
        expectedError: /empty/i,
      },
    ])('$description', async ({ argv, expectedError }) => {
      await assertFailedRun(argv, expectedError);
    });
  });
});

async function assertSuccessfulRun(argv: string[], expected: string | RegExp) {
  const output = await execaNode(binaryPath, argv);
  expect(output.stderr).toEqual('');
  expect(output.exitCode).toEqual(0);
  expect(output.failed).toEqual(false);
  if (typeof expected === 'string') {
    expect(output.stdout).toEqual(expected);
  } else {
    expect(output.stdout).toMatch(expected);
  }
}

async function assertFailedRun(argv: string[], expected: string | RegExp) {
  const output = await execaNode(binaryPath, argv, { reject: false });
  const slugi = new Slugi(DEFAULT_OPTIONS, vi.fn());
  expect(output.stderr).toMatch(slugi.helpMessage);
  expect(output.stdout).toEqual('');
  expect(output.exitCode).toEqual(1);
  expect(output.failed).toEqual(true);
  if (typeof expected === 'string') {
    expect(output.stderr).toEqual(expected);
  } else {
    expect(output.stderr).toMatch(expected);
  }
}
