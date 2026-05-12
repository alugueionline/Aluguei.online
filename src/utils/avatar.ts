/**
 * Gera uma URL de avatar do DiceBear baseada no nome, 
 * tentando identificar o gênero de forma heurística.
 */
export const getTenantAvatar = (name: string) => {
  if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;

  const firstName = name.split(' ')[0].toLowerCase();
  
  // Heurística simples para nomes em português
  // Nomes terminados em 'a' costumam ser femininos, com exceções como 'Luca', 'Joshua', etc.
  const exceptionsMale = ['luca', 'joshua', 'nicolas', 'batista', 'garcia'];
  const commonFemaleNames = ['alice', 'beatriz', 'isabel', 'iris', 'ester', 'ruth', 'mabel', 'yasmin', 'vivian'];
  
  const isFemale = (firstName.endsWith('a') && !exceptionsMale.includes(firstName)) || 
                  commonFemaleNames.includes(firstName);
  
  // Usamos seeds diferentes para garantir estilos visuais condizentes
  const genderSeed = isFemale ? `female-${name}` : `male-${name}`;
  
  // Estilos de fundo premium
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${genderSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};