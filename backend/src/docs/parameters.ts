export const parameters = {
  UserId: {
    name: 'id',
    in: 'path',
    description: 'UUID of the user',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e..',
    },
  },
};
