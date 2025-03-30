import { v4 as uuidv4 } from "uuid";

/**
 * Generates a single voucher with the specified format
 * @returns {Object} A voucher object
 */
export function generateVoucher() {
  // Generate a unique batch number with RSV prefix + 8 random digits
  const batchNo = `RSV-${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Target date: March 21, 2025
  const targetDate = new Date("2025-03-21T12:00:00Z");
  const seconds = Math.floor(targetDate.getTime() / 1000);
  const nanoseconds = (targetDate.getTime() % 1000) * 1000000;

  // Create voucher
  return {
    id: uuidv4().replace(/-/g, "").substring(0, 20), // Generate ID similar to the example
    status: "UNCLAIMED",
    createdAt: {
      seconds,
      nanoseconds,
    },
    batchNo,
  };
}

/**
 * Generates multiple vouchers
 * @param {number} count - Number of vouchers to generate
 * @returns {Array} Array of voucher objects
 */
export function generateVouchers(count) {
  const vouchers = [];
  const batchNos = new Set(); // Track batch numbers to ensure uniqueness

  for (let i = 0; i < count; i++) {
    let voucher;

    // Ensure batch number is unique
    do {
      voucher = generateVoucher();
    } while (batchNos.has(voucher.batchNo));

    batchNos.add(voucher.batchNo);
    vouchers.push(voucher);
  }

  return vouchers;
}
