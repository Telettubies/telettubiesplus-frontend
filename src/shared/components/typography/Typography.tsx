import React from 'react';

/**
 * Sistema tipográfico único de 3 estilos globales para todo el proyecto (Montserrat):
 * 1. `title` (.typo-title): Títulos, encabezados de sección y cifras KPI.
 * 2. `body`  (.typo-body):  Párrafos, contenido de tablas, formularios y descripciones.
 * 3. `label` (.typo-label): Etiquetas, códigos técnicos, fechas, badges y metadatos.
 */
export const TYPOGRAPHY = {
  title: 'typo-title',
  body: 'typo-body',
  label: 'typo-label',
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as: Component = 'span',
  className = '',
  children,
  ...rest
}) => {
  return (
    <Component className={`${TYPOGRAPHY[variant]} ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
};

export const TitleText: React.FC<Omit<TypographyProps, 'variant'>> = ({
  as = 'h2',
  ...props
}) => <Typography variant="title" as={as} {...props} />;

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = ({
  as = 'p',
  ...props
}) => <Typography variant="body" as={as} {...props} />;

export const LabelText: React.FC<Omit<TypographyProps, 'variant'>> = ({
  as = 'span',
  ...props
}) => <Typography variant="label" as={as} {...props} />;

