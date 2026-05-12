const fs = require('fs');
const content = fs.readFileSync('src/pages/DaftarCenter.jsx', 'utf8');
const lines = content.split('\n');

// Find start (line 273, 0-indexed = 272) and end of parseKtpOcr
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function parseKtpOcr(text)')) start = i;
    if (start >= 0 && i > start && lines[i] === '}' && lines[i+1] !== undefined && lines[i+1].trim().startsWith('function parseTax')) {
        end = i;
        break;
    }
}

if (start < 0 || end < 0) {
    console.error('Could not find parseKtpOcr. start=' + start + ' end=' + end);
    process.exit(1);
}
console.log('Replacing lines', start, '-', end);

const newFn = [
'function parseKtpOcr(text) {',
'    // Collapse all whitespace runs to a single space (keep newlines)',
'    const norm = text.replace(/[ \\t\\u00A0]+/g, \' \');',
'    const rawLines = norm.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);',
'',
'    // Strategy 1: Field Map',
'    // Split each line at the FIRST colon: key = before colon, value = after.',
'    // Handles "Nama         : DEBBY ANGGRAINI" regardless of spacing.',
'    const fieldMap = {};',
'    for (const line of rawLines) {',
'        const ci = line.indexOf(\':\');',
'        if (ci < 1 || ci > 45) continue;',
'        const key = line.slice(0, ci).trim().toLowerCase();',
'        // Stop value at first double-space (next column, e.g. "Gol. Darah")',
'        const val = line.slice(ci + 1).trim().split(/  +/)[0].trim();',
'        if (key && val && !fieldMap[key]) fieldMap[key] = val;',
'    }',
'',
'    // Lookup by one or more regex patterns against map keys',
'    const fromMap = (...pats) => {',
'        for (const p of pats) {',
'            const re = new RegExp(p, \'i\');',
'            const k = Object.keys(fieldMap).find(k => re.test(k));',
'            if (k) return fieldMap[k];',
'        }',
'        return \'\';',
'    };',
'',
'    // Strategy 2: scan each line with label+colon+value regex',
'    const fromLine = (labelRe) => {',
'        const re = new RegExp(labelRe + \'[^:\\\\n]*:\\\\s*([^\\\\n]+)\', \'i\');',
'        for (const line of rawLines) {',
'            const m = line.match(re);',
'            if (m?.[1]?.trim()) return m[1].trim().split(/  +/)[0].trim();',
'        }',
'        return \'\';',
'    };',
'',
'    // Strategy 3: label alone on one line, value on the next',
'    const fromNext = (labelRe) => {',
'        const re = new RegExp(\'^\' + labelRe + \'\\\\s*$\', \'i\');',
'        for (let i = 0; i < rawLines.length - 1; i++) {',
'            if (re.test(rawLines[i])) return rawLines[i + 1].replace(/^[:\\-]\\s*/, \'\').trim();',
'        }',
'        return \'\';',
'    };',
'',
'    const find = (mapPats, lineRe) =>',
'        fromMap(...mapPats) || fromLine(lineRe) || fromNext(lineRe);',
'',
'    const result = {};',
'',
'    // NIK: 16 digits',
'    const nikM = norm.match(/NIK[^:\\n]*:\\s*([\\d ]{14,20})/i);',
'    if (nikM) result.nik = nikM[1].replace(/\\s/g, \'\').slice(0, 16);',
'',
'    // Full name',
'    result.full_name = find([\'^nama$\', \'nama\'], \'Nama\');',
'',
'    // Tempat / Tgl Lahir',
'    const birthRaw = find([\'^tempat\', \'tempat.{0,14}lahir\'], \'Tempat.{0,14}Lahir\');',
'    if (birthRaw) {',
'        const ci = birthRaw.indexOf(\',\');',
'        if (ci > 0) {',
'            result.birth_place = birthRaw.slice(0, ci).trim();',
'            const dm = birthRaw.slice(ci).match(/(\\d{2})[\\/\\-](\\d{2})[\\/\\-](\\d{4})/);',
'            if (dm) result.birth_date = dm[3] + \'-\' + dm[2].padStart(2,\'0\') + \'-\' + dm[1].padStart(2,\'0\');',
'        } else {',
'            const dm = birthRaw.match(/(\\d{2})[\\/\\-](\\d{2})[\\/\\-](\\d{4})/);',
'            if (dm) {',
'                result.birth_date = dm[3] + \'-\' + dm[2].padStart(2,\'0\') + \'-\' + dm[1].padStart(2,\'0\');',
'                result.birth_place = birthRaw.replace(dm[0], \'\').trim();',
'            } else {',
'                result.birth_place = birthRaw;',
'            }',
'        }',
'    }',
'    if (!result.birth_date) {',
'        const dm = norm.match(/(\\d{2})[\\/\\-](\\d{2})[\\/\\-](\\d{4})/);',
'        if (dm) result.birth_date = dm[3] + \'-\' + dm[2].padStart(2,\'0\') + \'-\' + dm[1].padStart(2,\'0\');',
'    }',
'',
'    // Gender',
'    const gRaw = find([\'^jenis kelamin$\', \'jenis.{0,5}kelamin\'], \'Jenis.{0,5}Kelamin\');',
'    if (/laki/i.test(gRaw)) result.gender = \'L\';',
'    else if (/perempuan/i.test(gRaw)) result.gender = \'P\';',
'',
'    // Religion: field map + keyword fallback',
'    result.religion = find([\'^agama$\', \'agama\'], \'Agama\');',
'    if (!result.religion) {',
'        const hit = [\'Islam\',\'Kristen\',\'Katolik\',\'Hindu\',\'Buddha\',\'Konghucu\']',
'            .find(r => new RegExp(\'\\\\b\' + r + \'\\\\b\', \'i\').test(norm));',
'        if (hit) result.religion = hit;',
'    }',
'',
'    result.marital_status = find(',
'        [\'^status perkawinan$\', \'status perkawinan\', \'^status$\'],',
'        \'Status.{0,15}Perkawinan\'',
'    );',
'    result.occupation = find([\'^pekerjaan$\', \'pekerjaan\'], \'Pekerjaan\');',
'',
'    return result;',
'}'
].join('\n');

const before = lines.slice(0, start).join('\n');
const after = lines.slice(end + 1).join('\n');
const result = before + '\n' + newFn + '\n' + after;
fs.writeFileSync('src/pages/DaftarCenter.jsx', result, 'utf8');
console.log('Done.');
