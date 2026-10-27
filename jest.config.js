const nextJest = require('next/jest');

// Menyediakan path ke aplikasi Next.js untuk memuat file next.config.js dan .env
const createJestConfig = nextJest({
  dir: './',
});

// Konfigurasi kustom Jest
const customJestConfig = {
  // Menggunakan 'node' karena kita menguji backend/service, bukan komponen UI React
  testEnvironment: 'node',
  
  // Memetakan path alias @/ agar dikenali Jest (opsional karena next/jest biasanya otomatis mengenali, tapi disarankan untuk jaga-jaga)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

// Mengekspor konfigurasi agar bisa dipakai oleh Jest
module.exports = createJestConfig(customJestConfig);