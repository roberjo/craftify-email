import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Craftify Email API',
      version: '1.0.0',
      description: 'Email Template Management System API',
      contact: {
        name: 'Craftify Email Team',
        email: 'team@craftify-email.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.craftify-email.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid request data',
                },
                details: {
                  type: 'string',
                  example: 'Field "email" is required',
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
                requestId: {
                  type: 'string',
                },
              },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            uptime: {
              type: 'number',
              example: 146.259604245,
            },
            environment: {
              type: 'string',
              example: 'development',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
          },
        },
        ApiInfoResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Craftify Email API',
                },
                version: {
                  type: 'string',
                  example: '1.0.0',
                },
                description: {
                  type: 'string',
                  example: 'Email Template Management System API',
                },
                endpoints: {
                  type: 'object',
                  properties: {
                    health: {
                      type: 'string',
                      example: '/health',
                    },
                    api: {
                      type: 'string',
                      example: '/api',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status endpoints',
      },
      {
        name: 'API Info',
        description: 'API information and documentation endpoints',
      },
      {
        name: 'Templates',
        description: 'Email template management endpoints',
      },
      {
        name: 'Folders',
        description: 'Folder organization endpoints',
      },
      {
        name: 'Approvals',
        description: 'Template approval workflow endpoints',
      },
      {
        name: 'Users',
        description: 'User management and authentication endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const specs = swaggerJsdoc(options); 