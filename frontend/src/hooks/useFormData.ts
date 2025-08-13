import { useMemo } from 'react';

/**
 * Hook para detectar se há dados preenchidos em um objeto de formulário
 * 
 * @param formData - Objeto com os dados do formulário
 * @param fieldsToCheck - Array com os campos específicos para verificar
 * @returns boolean indicando se há dados preenchidos
 */
export const useHasFormData = (
  formData: Record<string, any>, 
  fieldsToCheck?: string[]
): boolean => {
  return useMemo(() => {
    const fieldsToValidate = fieldsToCheck || Object.keys(formData);
    
    return fieldsToValidate.some(field => {
      const value = formData[field];
      
      // Verifica se o valor não está vazio
      if (value === null || value === undefined) {
        return false;
      }
      
      // Para strings
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      
      // Para números
      if (typeof value === 'number') {
        return value !== 0;
      }
      
      // Para booleanos
      if (typeof value === 'boolean') {
        return value === true;
      }
      
      // Para arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      // Para objetos
      if (typeof value === 'object') {
        return Object.keys(value).length > 0;
      }
      
      return false;
    });
  }, [formData, fieldsToCheck]);
};

/**
 * Hook para detectar dados preenchidos em múltiplas seções de formulário
 * 
 * @param formData - Objeto completo do formulário
 * @param sections - Objeto mapeando seções para campos
 * @returns Objeto com status de cada seção
 */
export const useFormSectionsData = (
  formData: Record<string, any>,
  sections: Record<string, string[]>
): Record<string, boolean> => {
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    
    Object.entries(sections).forEach(([sectionName, fields]) => {
      result[sectionName] = fields.some(field => {
        const value = formData[field];
        
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'boolean') return value === true;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        
        return false;
      });
    });
    
    return result;
  }, [formData, sections]);
};