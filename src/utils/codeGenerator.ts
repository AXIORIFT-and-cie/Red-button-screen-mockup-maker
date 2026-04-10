const WIDTH = 128;
const HEIGHT = 64;

export type CodeFormat = 'javascript' | 'python';

/**
 * Generates MakeCode JavaScript code using the OLED12864_I2C extension
 * that reproduces the drawn image on a 128x64 SSD1306 OLED display.
 */
export function generateMakeCodeJS(pixels: boolean[][]): string {
  const litPixels: [number, number][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (pixels[y]?.[x]) {
        litPixels.push([x, y]);
      }
    }
  }

  if (litPixels.length === 0) {
    return [
      '// OLED 128x64 - MakeCode JavaScript',
      '// Extension: https://github.com/makecode-extensions/OLED12864_I2C',
      '',
      'OLED12864_I2C.init(60)',
      'OLED12864_I2C.clear()',
      'OLED12864_I2C.draw()',
    ].join('\n');
  }

  // Try to optimize: detect horizontal runs for hline usage
  const lines: string[] = [
    '// OLED 128x64 - MakeCode JavaScript',
    '// Extension: https://github.com/makecode-extensions/OLED12864_I2C',
    '// Add extension in MakeCode: paste the GitHub URL above',
    '',
    'OLED12864_I2C.init(60)',
    'OLED12864_I2C.clear()',
    '',
  ];

  // Build optimized draw commands using hlines where possible
  for (let y = 0; y < HEIGHT; y++) {
    let x = 0;
    while (x < WIDTH) {
      if (pixels[y]?.[x]) {
        // Find run length
        let runLen = 0;
        while (x + runLen < WIDTH && pixels[y]?.[x + runLen]) {
          runLen++;
        }
        if (runLen >= 3) {
          lines.push(`OLED12864_I2C.hline(${x}, ${y}, ${runLen}, 1)`);
        } else {
          for (let i = 0; i < runLen; i++) {
            lines.push(`OLED12864_I2C.pixel(${x + i}, ${y}, 1)`);
          }
        }
        x += runLen;
      } else {
        x++;
      }
    }
  }

  lines.push('');
  lines.push('OLED12864_I2C.draw()');

  return lines.join('\n');
}

/**
 * Generates MakeCode Python code (alternative format)
 */
export function generateMakeCodePython(pixels: boolean[][]): string {
  const litPixels: [number, number][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (pixels[y]?.[x]) {
        litPixels.push([x, y]);
      }
    }
  }

  if (litPixels.length === 0) {
    return [
      '# OLED 128x64 - MakeCode Python',
      '# Extension: https://github.com/makecode-extensions/OLED12864_I2C',
      '',
      'OLED12864_I2C.init(60)',
      'OLED12864_I2C.clear()',
      'OLED12864_I2C.draw()',
    ].join('\n');
  }

  const lines: string[] = [
    '# OLED 128x64 - MakeCode Python',
    '# Extension: https://github.com/makecode-extensions/OLED12864_I2C',
    '# Add extension in MakeCode: paste the GitHub URL above',
    '',
    'OLED12864_I2C.init(60)',
    'OLED12864_I2C.clear()',
    '',
  ];

  for (let y = 0; y < HEIGHT; y++) {
    let x = 0;
    while (x < WIDTH) {
      if (pixels[y]?.[x]) {
        let runLen = 0;
        while (x + runLen < WIDTH && pixels[y]?.[x + runLen]) {
          runLen++;
        }
        if (runLen >= 3) {
          lines.push(`OLED12864_I2C.hline(${x}, ${y}, ${runLen}, 1)`);
        } else {
          for (let i = 0; i < runLen; i++) {
            lines.push(`OLED12864_I2C.pixel(${x + i}, ${y}, 1)`);
          }
        }
        x += runLen;
      } else {
        x++;
      }
    }
  }

  lines.push('');
  lines.push('OLED12864_I2C.draw()');

  return lines.join('\n');
}

/**
 * Count lit pixels for stats
 */
export function countLitPixels(pixels: boolean[][]): number {
  let count = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (pixels[y]?.[x]) count++;
    }
  }
  return count;
}
