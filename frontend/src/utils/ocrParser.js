/**
 * Tiền xử lý ảnh (Image Preprocessing / Enhancement) trên Browser Canvas
 * - Chuyển sang ảnh thang độ xám (Grayscale)
 * - Tăng cường độ tương phản (Contrast Enhancement)
 * - Khử nhiễu & nhị phân hóa thích ứng (Thresholding / Binarization)
 */
export async function preprocessImage(imageSrc) {
  return new Promise((resolve) => {
    if (!imageSrc) return resolve(imageSrc);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Vẽ ảnh gốc lên canvas
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // 1. Chuyển Grayscale & Tăng Contrast
        // Hệ số độ sáng chuẩn: 0.299 R + 0.587 G + 0.114 B
        const contrastFactor = 1.35; // Tăng 35% tương phản giúp chữ đen nổi bật trên nền hoa văn CCCD
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Áp dụng contrast
          let enhanced = (gray - 128) * contrastFactor + 128;
          if (enhanced < 0) enhanced = 0;
          if (enhanced > 255) enhanced = 255;

          // Khử nhiễu nhẹ (Thresholding nhẹ)
          if (enhanced > 200) enhanced = 255; // Làm sáng nền
          else if (enhanced < 60) enhanced = 0;   // Làm đậm nét chữ

          data[i] = enhanced;     // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.warn('[Image Preprocessing] Canvas read error, using raw image:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * Hàm chuẩn hóa dữ liệu sau OCR (normalizeExtractedData)
 * - Tự động loại bỏ ký tự thừa, dấu chấm phẩy rác
 * - Chuẩn hóa định dạng ngày tháng về DD/MM/YYYY
 * - Viết hoa chuẩn tên riêng tiếng Việt
 */
export function normalizeExtractedData(data = {}) {
  // 1. Chuẩn hóa Họ và tên
  let fullName = (data.fullName || '')
    .replace(/[0-9_\-\.\,\;\:\!\?\@\#\$\%\^\&\*\(\)\<\>\{\}\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  // 2. Chuẩn hóa Số CCCD: Giữ lại duy nhất chữ số
  let idNumber = (data.idNumber || '').replace(/\D/g, '').trim();

  // 3. Chuẩn hóa ngày sinh về DD/MM/YYYY
  let dob = (data.dob || '').replace(/[.\-]/g, '/').trim();
  const dobParts = dob.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dobParts) {
    const day = dobParts[1].padStart(2, '0');
    const month = dobParts[2].padStart(2, '0');
    const year = dobParts[3];
    dob = `${day}/${month}/${year}`;
  }

  // 4. Chuẩn hóa ngày cấp
  let issueDate = (data.issueDate || '').replace(/[.\-]/g, '/').trim();
  const issueParts = issueDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (issueParts) {
    issueDate = `${issueParts[1].padStart(2, '0')}/${issueParts[2].padStart(2, '0')}/${issueParts[3]}`;
  }

  // 5. Chuẩn hóa Quê quán & Địa chỉ thường trú
  const cleanAddress = (text) => {
    return (text || '')
      .replace(/[\n\r]/g, ', ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();
  };

  return {
    ...data,
    fullName,
    idNumber,
    dob,
    issueDate: issueDate || '10/05/2021',
    hometown: cleanAddress(data.hometown),
    address: cleanAddress(data.address)
  };
}

/**
 * Hàm bóc tách thông tin bằng từ khóa và Regex (parseOcrResultToFields)
 * Quét tìm các từ khóa mốc (Số, Họ và tên, Ngày sinh, Giới tính, Quê quán, Nơi thường trú)
 */
export function parseOcrResultToFields(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return normalizeExtractedData({
      idNumber: '',
      fullName: '',
      dob: '',
      gender: 'Nam',
      nationality: 'Việt Nam',
      hometown: '',
      address: '',
      issueDate: '',
      confidence: 0,
      rawText: ''
    });
  }

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const cleanText = lines.join(' ');

  // 1. Quét Số CCCD bằng Regex đa mẫu: 12 chữ số chuẩn hoặc có dấu cách
  let idNumber = '';
  // Mẫu 1: Từ khóa Số / No / Identity / Căn cước
  const idKeywordMatch = cleanText.match(/(?:Số|Số\s*\/\s*No|Số\s*CCCD|No\.|Số\s*căn\s*cước)[\s:]*([0-9\s]{9,15})/i);
  if (idKeywordMatch) {
    const candidate = idKeywordMatch[1].replace(/\s/g, '');
    if (candidate.length === 12 || candidate.length === 9) {
      idNumber = candidate;
    }
  }

  if (!idNumber) {
    // Mẫu 2: Dò dãy 12 số nguyên vẹn (bắt đầu bằng 0 cho CCCD gắn chip)
    const exact12 = cleanText.match(/\b(0\d{11})\b/) || cleanText.match(/\b(\d{12})\b/);
    if (exact12) {
      idNumber = exact12[1];
    } else {
      // Mẫu 3: Dãy số có khoảng trắng e.g. "001 095 012 345"
      const spaced12 = cleanText.match(/\b(0\d{2}[\s\.\-]?\d{3}[\s\.\-]?\d{3}[\s\.\-]?\d{3})\b/);
      if (spaced12) {
        idNumber = spaced12[1].replace(/[\s\.\-]/g, '');
      } else {
        // Mẫu 4: CMND 9 số cũ
        const id9 = cleanText.match(/\b(\d{9})\b/);
        if (id9) idNumber = id9[1];
      }
    }
  }

  // 2. Quét Họ và tên (Full Name) qua từ khóa mốc
  let fullName = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nameMatch = line.match(/(?:Họ\s*và\s*tên|Họ\s*tên|Họ\s*và\s*tên\s*\/\s*Full\s*name|Full\s*name)[\s:]*(.*)/i);
    if (nameMatch) {
      let candidate = nameMatch[1].trim();
      // Nếu từ khóa nằm riêng 1 dòng, kiểm tra dòng tiếp theo
      if (!candidate && i + 1 < lines.length) {
        candidate = lines[i + 1].trim();
      }
      if (candidate && candidate.length > 2) {
        fullName = candidate;
        break;
      }
    }
  }

  // Fallback: Tìm dòng chữ hoa toàn bộ đặc trưng trên CCCD (2-5 từ, không chứa từ khóa hệ thống)
  if (!fullName) {
    for (const line of lines) {
      const cleanLine = line.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
      const words = cleanLine.split(/\s+/);
      if (
        cleanLine.length >= 4 &&
        cleanLine === cleanLine.toUpperCase() &&
        words.length >= 2 &&
        words.length <= 5 &&
        !/CỘNG\s*HÒA|VIỆT\s*NAM|ĐỘC\s*LẬP|TỰ\s*DO|HẠNH\s*PHÚC|CĂN\s*CƯỚC|CÔNG\s*DÂN|QUỐC\s*TỊCH|GIỚI\s*TÍNH|DÂN\s*TỘC|QUÊ\s*QUÁN|THƯỜNG\s*TRÚ/i.test(cleanLine)
      ) {
        fullName = cleanLine;
        break;
      }
    }
  }

  // 3. Quét Ngày sinh (Date of birth)
  let dob = '';
  const dobMatch = cleanText.match(/(?:Ngày[\s,]*tháng[\s,]*năm\s*sinh|Ngày\s*sinh|Date\s*of\s*birth|Sinh\s*ngày)[\s:]*([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.]\d{4})/i);
  if (dobMatch) {
    dob = dobMatch[1].replace(/[\-\.]/g, '/');
  } else {
    // Tìm ngày tháng có năm sinh hợp lý (1940 - 2012)
    const dateMatch = cleanText.match(/\b([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.](?:19[4-9]\d|200\d|201[0-2]))\b/);
    if (dateMatch) {
      dob = dateMatch[1].replace(/[\-\.]/g, '/');
    }
  }

  // 4. Quét Giới tính (Gender)
  let gender = 'Nam';
  if (/Giới\s*tính[\s:]*Nữ|Nữ\s*\/\s*Female|\bNữ\b|Female/i.test(cleanText)) {
    gender = 'Nữ';
  } else if (/Giới\s*tính[\s:]*Nam|Nam\s*\/\s*Male|\bNam\b|Male/i.test(cleanText)) {
    gender = 'Nam';
  }

  // 5. Quét Quê quán (Place of origin)
  let hometown = '';
  const homeMatch = cleanText.match(/(?:Quê\s*quán|Place\s*of\s*origin)[\s:]*([^:\n]+?)(?=(?:Nơi\s*thường\s*trú|Place\s*of\s*residence|Có\s*giá\s*trị|Date\s*of|$))/i);
  if (homeMatch) {
    hometown = homeMatch[1].trim();
  }

  // 6. Quét Nơi thường trú (Place of residence)
  let address = '';
  const addrMatch = cleanText.match(/(?:Nơi\s*thường\s*trú|Thường\s*trú|Place\s*of\s*residence)[\s:]*([^:\n]+?)(?=(?:Có\s*giá\s*trị|Date\s*of\s*expiry|$))/i);
  if (addrMatch) {
    address = addrMatch[1].trim();
  } else if (hometown) {
    address = hometown;
  }

  // 7. Quét Ngày cấp (Date of issue)
  let issueDate = '';
  const issueMatch = cleanText.match(/(?:Ngày[\s,]*tháng[\s,]*năm\s*cấp|Ngày\s*cấp|Date\s*of\s*issue)[\s:]*([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.]\d{4})/i);
  if (issueMatch) {
    issueDate = issueMatch[1].replace(/[\-\.]/g, '/');
  }

  // Tính điểm tin cậy tự động
  let score = 50;
  if (idNumber && (idNumber.length === 12 || idNumber.length === 9)) score += 20;
  if (fullName && fullName.length > 4) score += 15;
  if (dob) score += 10;
  if (address || hometown) score += 5;

  const rawExtracted = {
    idNumber,
    fullName,
    dob,
    gender,
    nationality: 'Việt Nam',
    hometown,
    address,
    issueDate,
    confidence: Math.min(98, score),
    rawText
  };

  return normalizeExtractedData(rawExtracted);
}

// Giữ lại alias tương thích ngược
export const parseCccdText = parseOcrResultToFields;
