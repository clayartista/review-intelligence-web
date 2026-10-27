export function validateFavoriteInput(body) {
  if (!body || typeof body !== "object" || !body.user_id || !body.id || !body.name) {
    return { valid: false, error: "user_id wajib diisi" };
  }

  return { valid: true };
}