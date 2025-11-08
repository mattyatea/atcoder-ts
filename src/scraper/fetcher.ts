import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Problem, TestCase } from '../types';
import { convertVarToMath } from '../utils/text-utils';

export async function fetchContestTasks(contestUrl: string, logger: any): Promise<string[]> {
  const tasksUrl = contestUrl.endsWith('/')
    ? `${contestUrl}tasks`
    : `${contestUrl}/tasks`;

  logger.info(`Fetching contest tasks...`);
  logger.detail('URL', tasksUrl);

  const response = await axios.get(tasksUrl);
  const $ = cheerio.load(response.data);

  const taskUrls: string[] = [];
  $('table tbody tr').each((_, element) => {
    const link = $(element).find('td:first-child a').attr('href');
    if (link) {
      taskUrls.push(`https://atcoder.jp${link}`);
    }
  });

  logger.success(`Found ${taskUrls.length} tasks`);
  return taskUrls;
}

function extractContent(elem: any, $: cheerio.CheerioAPI): string {
  const html = elem.html() || '';

  if (elem.is('table') || elem.is('center') || elem.find('table').length > 0) {
    return convertVarToMath(html);
  }
  if (elem.is('pre')) {
    return convertVarToMath(html);
  }

  const convertedHtml = convertVarToMath(html);
  const tempDiv = cheerio.load(convertedHtml);
  const text = tempDiv.text().trim();
  return text;
}

function extractStatement($: cheerio.CheerioAPI, langSection: cheerio.Cheerio<any>): string {
  if (langSection.length === 0) {
    return '';
  }

  let statementDiv = langSection.find('.lang-ja').first();
  if (statementDiv.length === 0) {
    statementDiv = langSection.find('.lang-en').first();
  }
  if (statementDiv.length === 0) {
    statementDiv = langSection;
  }

  const sections: string[] = [];
  const h3Elements = statementDiv.find('h3');

  h3Elements.each((idx, h3Elem) => {
    const $h3 = $(h3Elem);
    const sectionTitle = $h3.text().trim();

    if (sectionTitle.includes('入力例') || sectionTitle.includes('Sample Input') ||
        sectionTitle.includes('出力例') || sectionTitle.includes('Sample Output')) {
      return;
    }

    let content = '';
    let nextElem = $h3.next();

    while (nextElem.length > 0 && nextElem.prop('tagName')?.toLowerCase() !== 'h3') {
      const hasSkipClass = nextElem.hasClass('btn') ||
                           nextElem.hasClass('io-style') ||
                           nextElem.hasClass('sample-footer') ||
                           nextElem.find('.btn').length > 0;

      if (!hasSkipClass) {
        const text = nextElem.text().trim();

        if (text &&
            text !== 'Editorial' &&
            text !== 'Copy' &&
            !text.match(/^Editorial\s*$/i)) {
          const processedContent = extractContent(nextElem, $);
          content += processedContent + '\n\n\n\n';
        }
      }
      nextElem = nextElem.next();
    }

    if (content.trim()) {
      sections.push(`## ${sectionTitle}\n\n${content.trim()}`);
    }
  });

  return sections.join('\n\n\n\n');
}

function extractTestCases($: cheerio.CheerioAPI, langSection: cheerio.Cheerio<any>): TestCase[] {
  const testCases: TestCase[] = [];
  const sampleSections = langSection.find('.part');
  const inputs: string[] = [];
  const outputs: string[] = [];

  sampleSections.each((_, part) => {
    const $part = $(part);
    const h3Text = $part.find('h3').text().trim();

    if (h3Text.includes('入力例') || h3Text.includes('Sample Input')) {
      const pre = $part.find('pre').first();
      if (pre.length > 0) {
        inputs.push(pre.text().trim());
      }
    }

    if (h3Text.includes('出力例') || h3Text.includes('Sample Output')) {
      const pre = $part.find('pre').first();
      if (pre.length > 0) {
        outputs.push(pre.text().trim());
      }
    }
  });

  for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
    testCases.push({
      input: inputs[i],
      output: outputs[i]
    });
  }

  return testCases;
}

export async function fetchProblem(problemUrl: string, logger: any): Promise<Problem> {
  logger.info(`Fetching problem: ${problemUrl.split('/').pop()}`);
  const response = await axios.get(problemUrl);
  const $ = cheerio.load(response.data);

  const titleText = $('span.h2').first().text().trim();
  const [id, ...titleParts] = titleText.split(' - ');
  const title = titleParts.join(' - ').trim();

  const titleContainer = $('span.h2').first().parent();
  titleContainer.find('.btn').remove();

  const timeLimitText = $('p:contains("Time Limit:")').text();
  const memoryLimitText = $('p:contains("Memory Limit:")').text();
  const timeLimit = timeLimitText.replace('Time Limit:', '').trim();
  const memoryLimit = memoryLimitText.replace('Memory Limit:', '').trim();

  const langSection = $('#task-statement');
  const statement = extractStatement($, langSection);
  const testCases = extractTestCases($, langSection);

  return {
    id,
    title,
    url: problemUrl,
    timeLimit,
    memoryLimit,
    statement,
    testCases
  };
}
