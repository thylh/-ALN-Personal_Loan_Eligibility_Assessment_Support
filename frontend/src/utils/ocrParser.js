/**
 * Bộ bóc tách thông tin Căn cước công dân (CCCD) từ chuỗi OCR tiếng Việt
 * Hỗ trợ CCCD gắn chip (12 số) và CMND cũ (9 số)
 */

export function parseCccdText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      idNumber: '',
      fullName: '',
      dob: '',
      gender: 'Nam',
      nationality: 'Việt Nam',
      hometown: '',
      address: '',
      issueDate: '',
      issuePlace: 'Cục Cảnh sát QLHC về TTXH',
      confidence: 0
    };
  }

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const cleanText = lines.join(' ');

  // 1. Số CCCD: 12 chữ số (bắt đầu bằng 0) hoặc 9 chữ số CMND
  let idNumber = '';
  const idMatch12 = cleanText.match(/\b(0\d{11})\b/) || cleanText.match(/\b(\d{12})\b/);
  if (idMatch12) {
    idNumber = idMatch12[1];
  } else {
    // Try relaxed regex if digits are spaced e.g. 001 099 123 456
    const spacedMatch = cleanText.match(/\b(0\d{2}\s?\d{3}\s?\d{3}\s?\d{3})\b/);
    if (spacedMatch) {
      idNumber = spacedMatch[1].replace(/\s/g, '');
    } else {
      const idMatch9 = cleanText.match(/\b(\d{9})\b/);
      if (idMatch9) idNumber = idMatch9[1];
    }
  }

  // 2. Họ và tên (Full Name)
  let fullName = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/(?:Họ và tên|Họ tên|Họ và tên \/ Full name|Full name)[\s:]*(.*)/i);
    if (match) {
      let candidate = match[1].trim();
      // If the label is on its own line, look at the next line
      if (!candidate && i + 1 < lines.length) {
        candidate = lines[i + 1].trim();
      }
      if (candidate && candidate.length > 2) {
        fullName = candidate.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim().toUpperCase();
        break;
      }
    }
  }

  // Fallback: Tìm dòng chữ hoa toàn bộ dài từ 2 đến 5 từ (đặc trưng của tên trên CCCD)
  if (!fullName) {
    for (const line of lines) {
      const cleanLine = line.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
      const words = cleanLine.split(/\s+/);
      if (
        cleanLine === cleanLine.toUpperCase() &&
        words.length >= 2 &&
        words.length <= 5 &&
        !cleanLine.includes('CỘNG HÒA') &&
        !cleanLine.includes('VIỆT NAM') &&
        !cleanLine.includes('ĐỘC LẬP') &&
        !cleanLine.includes('CĂN CƯỚC') &&
        !cleanLine.includes('CÔNG DÂN') &&
        !cleanLine.includes('QUỐC TỊCH') &&
        !cleanLine.includes('GIỚI TÍNH')
      ) {
        fullName = cleanLine;
        break;
      }
    }
  }

  // 3. Ngày sinh (Date of Birth)
  let dob = '';
  const dobMatch = cleanText.match(/(?:Ngày sinh|Sinh ngày|Date of birth)[\s:]*([0-3]?\d[\/\-][0-1]?\d[\/\-]\d{4})/i);
  if (dobMatch) {
    dob = dobMatch[1].replace(/-/g, '/');
  } else {
    // Find any date pattern that looks like a realistic birth year (1950 - 2010)
    const allDates = [...cleanText.matchAll(/\b([0-3]?\d[\/\-][0-1]?\d[\/\-](19[5-9]\d|200\d|201\d))\b/g)];
    if (allDates.length > 0) {
      dob = allDates[0][1].replace(/-/g, '/');
    }
  }

  // 4. Giới tính (Gender)
  let gender = 'Nam';
  if (/Nữ|Female/i.test(cleanText)) {
    gender = 'Nữ';
  } else if (/Nam|Male/i.test(cleanText)) {
    gender = 'Nam';
  }

  // 5. Quê quán (Hometown)
  let hometown = '';
  const homeMatch = cleanText.match(/(?:Quê quán|Place of origin)[\s:]*([^,\n]+(?:,[^,\n]+)*)/i);
  if (homeMatch) {
    hometown = homeMatch[1].trim();
  }

  // 6. Nơi thường trú (Place of Residence)
  let address = '';
  const addrMatch = cleanText.match(/(?:Nơi thường trú|Thường trú|Place of residence)[\s:]*([^,\n]+(?:,[^,\n]+)*)/i);
  if (addrMatch) {
    address = addrMatch[1].trim();
  } else if (hometown) {
    address = hometown;
  }

  // 7. Ngày cấp (Issue Date)
  let issueDate = '';
  const issueMatch = cleanText.match(/(?:Ngày cấp|Date of issue)[\s:]*([0-3]?\d[\/\-][0-1]?\d[\/\-]\d{4})/i);
  if (issueMatch) {
    issueDate = issueMatch[1].replace(/-/g, '/');
  }

  // Compute calculated heuristic confidence
  let detectedCount = 0;
  if (idNumber) detectedCount += 3;
  if (fullName) detectedCount += 3;
  if (dob) detectedCount += 2;
  if (address) detectedCount += 1;
  if (hometown) detectedCount += 1;

  const confidence = Math.min(98, Math.max(50, Math.round((detectedCount / 10) * 100)));

  return {
    idNumber,
    fullName,
    dob,
    gender,
    nationality: 'Việt Nam',
    hometown,
    address,
    issueDate: issueDate || '10/05/2021',
    issuePlace: 'Cục Cảnh sát QLHC về TTXH',
    confidence,
    rawText
  };
}

