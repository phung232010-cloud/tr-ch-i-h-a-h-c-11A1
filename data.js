// Dữ liệu hóa học đầy đủ trích xuất từ bảng học tập
const CHEMISTRY_DATA = {
  // 17 Nguyên tố trong Dãy hoạt động hóa học & Câu nhớ
  metals: [
    { stt: 1, symbol: "K", phrase: "Khi", enName: "potassium", valence: "I", valenceArr: [1], category: "Kim loại kiềm" },
    { stt: 2, symbol: "Na", phrase: "Nào", enName: "sodium", valence: "I", valenceArr: [1], category: "Kim loại kiềm" },
    { stt: 3, symbol: "Ba", phrase: "Bà", enName: "barium", valence: "II", valenceArr: [2], category: "Kim loại kiềm thổ" },
    { stt: 4, symbol: "Ca", phrase: "Cần", enName: "calcium", valence: "II", valenceArr: [2], category: "Kim loại kiềm thổ" },
    { stt: 5, symbol: "Mg", phrase: "May", enName: "magnesium", valence: "II", valenceArr: [2], category: "Kim loại kiềm thổ" },
    { stt: 6, symbol: "Al", phrase: "Áo", enName: "aluminium", alias: "aluminum", valence: "III", valenceArr: [3], category: "Kim loại cơ bản" },
    { stt: 7, symbol: "Zn", phrase: "Záp", enName: "zinc", valence: "II", valenceArr: [2], category: "Kim loại chuyển tiếp" },
    { stt: 8, symbol: "Fe", phrase: "Sắt", enName: "iron", valence: "II, III", valenceArr: [2, 3], category: "Kim loại chuyển tiếp" },
    { stt: 9, symbol: "Ni", phrase: "Nhớ", enName: "nickel", valence: "II", valenceArr: [2], category: "Kim loại chuyển tiếp" },
    { stt: 10, symbol: "Sn", phrase: "Sang", enName: "tin", valence: "II, IV", valenceArr: [2, 4], category: "Kim loại sau chuyển tiếp" },
    { stt: 11, symbol: "Pb", phrase: "Phố", enName: "lead", valence: "II, IV", valenceArr: [2, 4], category: "Kim loại sau chuyển tiếp" },
    { stt: 12, symbol: "H", phrase: "Hỏi", enName: "hydrogen", valence: "I", valenceArr: [1], category: "Phi kim (Mốc so sánh)" },
    { stt: 13, symbol: "Cu", phrase: "Cửa", enName: "copper", valence: "I, II", valenceArr: [1, 2], category: "Kim loại chuyển tiếp" },
    { stt: 14, symbol: "Hg", phrase: "Hàng", enName: "mercury", valence: "I, II", valenceArr: [1, 2], category: "Kim loại chuyển tiếp (thể lỏng)" },
    { stt: 15, symbol: "Ag", phrase: "Á", enName: "silver", valence: "I", valenceArr: [1], category: "Kim loại quý" },
    { stt: 16, symbol: "Pt", phrase: "Phi", enName: "platinum", valence: "II, IV", valenceArr: [2, 4], category: "Kim loại quý" },
    { stt: 17, symbol: "Au", phrase: "Âu", enName: "gold", valence: "I, III", valenceArr: [1, 3], category: "Kim loại quý" }
  ],

  // 17 Acid và các gốc acid tương ứng
  acids: [
    {
      formula: "HCl",
      htmlFormula: "HCl",
      name: "hydrochloric acid",
      type: "Mạnh",
      radicals: [
        { formula: "Cl⁻", htmlFormula: "Cl<sup>-</sup>", valence: "I", valenceNum: 1, name: "chloride" }
      ]
    },
    {
      formula: "HBr",
      htmlFormula: "HBr",
      name: "hydrobromic acid",
      type: "Mạnh",
      radicals: [
        { formula: "Br⁻", htmlFormula: "Br<sup>-</sup>", valence: "I", valenceNum: 1, name: "bromide" }
      ]
    },
    {
      formula: "HI",
      htmlFormula: "HI",
      name: "hydroiodic acid",
      type: "Mạnh",
      radicals: [
        { formula: "I⁻", htmlFormula: "I<sup>-</sup>", valence: "I", valenceNum: 1, name: "iodide" }
      ]
    },
    {
      formula: "HF",
      htmlFormula: "HF",
      name: "hydrofluoric acid",
      type: "Yếu",
      radicals: [
        { formula: "F⁻", htmlFormula: "F<sup>-</sup>", valence: "I", valenceNum: 1, name: "fluoride" }
      ]
    },
    {
      formula: "HNO3",
      htmlFormula: "HNO<sub>3</sub>",
      name: "nitric acid",
      type: "Mạnh",
      radicals: [
        { formula: "NO₃⁻", htmlFormula: "NO<sub>3</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "nitrate" }
      ]
    },
    {
      formula: "HNO2",
      htmlFormula: "HNO<sub>2</sub>",
      name: "nitrous acid",
      type: "Yếu",
      radicals: [
        { formula: "NO₂⁻", htmlFormula: "NO<sub>2</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "nitrite" }
      ]
    },
    {
      formula: "H2SO4",
      htmlFormula: "H<sub>2</sub>SO<sub>4</sub>",
      name: "sulfuric acid",
      type: "Mạnh",
      radicals: [
        { formula: "HSO₄⁻", htmlFormula: "HSO<sub>4</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "hydrogen sulfate" },
        { formula: "SO₄²⁻", htmlFormula: "SO<sub>4</sub><sup>2-</sup>", valence: "II", valenceNum: 2, name: "sulfate" }
      ]
    },
    {
      formula: "H2SO3",
      htmlFormula: "H<sub>2</sub>SO<sub>3</sub>",
      name: "sulfurous acid",
      type: "Yếu",
      radicals: [
        { formula: "HSO₃⁻", htmlFormula: "HSO<sub>3</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "hydrogen sulfite" },
        { formula: "SO₃²⁻", htmlFormula: "SO<sub>3</sub><sup>2-</sup>", valence: "II", valenceNum: 2, name: "sulfite" }
      ]
    },
    {
      formula: "H2CO3",
      htmlFormula: "H<sub>2</sub>CO<sub>3</sub>",
      name: "carbonic acid",
      type: "Yếu",
      radicals: [
        { formula: "HCO₃⁻", htmlFormula: "HCO<sub>3</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "hydrogen carbonate / bicarbonate" },
        { formula: "CO₃²⁻", htmlFormula: "CO<sub>3</sub><sup>2-</sup>", valence: "II", valenceNum: 2, name: "carbonate" }
      ]
    },
    {
      formula: "H2S",
      htmlFormula: "H<sub>2</sub>S",
      name: "hydrosulfuric acid",
      type: "Yếu",
      radicals: [
        { formula: "HS⁻", htmlFormula: "HS<sup>-</sup>", valence: "I", valenceNum: 1, name: "hydrosulfide" },
        { formula: "S²⁻", htmlFormula: "S<sup>2-</sup>", valence: "II", valenceNum: 2, name: "sulfide" }
      ]
    },
    {
      formula: "H3PO4",
      htmlFormula: "H<sub>3</sub>PO<sub>4</sub>",
      name: "phosphoric acid",
      type: "Yếu",
      radicals: [
        { formula: "H₂PO₄⁻", htmlFormula: "H<sub>2</sub>PO<sub>4</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "dihydrogen phosphate" },
        { formula: "HPO₄²⁻", htmlFormula: "HPO<sub>4</sub><sup>2-</sup>", valence: "II", valenceNum: 2, name: "hydrogen phosphate" },
        { formula: "PO₄³⁻", htmlFormula: "PO<sub>4</sub><sup>3-</sup>", valence: "III", valenceNum: 3, name: "phosphate" }
      ]
    },
    {
      formula: "HClO",
      htmlFormula: "HClO",
      name: "hypochlorous acid",
      type: "Yếu",
      radicals: [
        { formula: "ClO⁻", htmlFormula: "ClO<sup>-</sup>", valence: "I", valenceNum: 1, name: "hypochlorite" }
      ]
    },
    {
      formula: "HClO2",
      htmlFormula: "HClO<sub>2</sub>",
      name: "chlorous acid",
      type: "Yếu",
      radicals: [
        { formula: "ClO₂⁻", htmlFormula: "ClO<sub>2</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "chlorite" }
      ]
    },
    {
      formula: "HClO3",
      htmlFormula: "HClO<sub>3</sub>",
      name: "chloric acid",
      type: "Mạnh",
      radicals: [
        { formula: "ClO₃⁻", htmlFormula: "ClO<sub>3</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "chlorate" }
      ]
    },
    {
      formula: "HClO4",
      htmlFormula: "HClO<sub>4</sub>",
      name: "perchloric acid",
      type: "Mạnh",
      radicals: [
        { formula: "ClO₄⁻", htmlFormula: "ClO<sub>4</sub><sup>-</sup>", valence: "I", valenceNum: 1, name: "perchlorate" }
      ]
    },
    {
      formula: "HCOOH",
      htmlFormula: "HCOOH",
      name: "formic acid",
      type: "Yếu",
      radicals: [
        { formula: "HCOO⁻", htmlFormula: "HCOO<sup>-</sup>", valence: "I", valenceNum: 1, name: "formate" }
      ]
    },
    {
      formula: "CH3COOH",
      htmlFormula: "CH<sub>3</sub>COOH",
      name: "acetic acid",
      type: "Yếu",
      radicals: [
        { formula: "CH₃COO⁻", htmlFormula: "CH<sub>3</sub>COO<sup>-</sup>", valence: "I", valenceNum: 1, name: "acetate" }
      ]
    }
  ]
};

// Flattened list của các gốc acid để dễ phục vụ cho các mini-game
CHEMISTRY_DATA.allRadicals = [];
CHEMISTRY_DATA.acids.forEach(acid => {
  acid.radicals.forEach(rad => {
    CHEMISTRY_DATA.allRadicals.push({
      ...rad,
      parentAcid: acid.formula,
      parentAcidName: acid.name,
      parentAcidType: acid.type
    });
  });
});
