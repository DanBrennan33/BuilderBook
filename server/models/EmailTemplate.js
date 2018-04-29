import mongoose, { Schema } from 'mongoose';
import Handlebars from 'handlebars';

import logger from '../logs';

const mongoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const EmailTemplate = mongoose.model('EmailTemplate', mongoSchema);

function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to Web App',
      message: `{{userName}},
        <p>
          At Web App, we are excited to help you build useful, production-ready web apps from scratch.
        </p>
        <p>
          See list of available books here.
        </p>

        Daniel,
        Team Web App
      `,
    },
  ];

  templates.forEach(async (template) => {
    if ((await EmailTemplate.find({ name: template.name }).count()) > 0) {
      return;
    }

    EmailTemplate
      .create(template)
      .catch((error) => {
        logger.error('EmailTemplate insertion error:', error);
      });
  });
}

insertTemplates();

export default async function getEmailTemplate(name, params) {
  const source = await EmailTemplate.findOne({ name });
  if (!source) {
    throw new Error('not found');
  }

  return {
    message: Handlebars.compile(source.message)(params),
    subject: Handlebars.compile(source.subject)(params),
  };
}
