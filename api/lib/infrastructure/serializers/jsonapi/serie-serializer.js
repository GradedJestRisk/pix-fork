const JSONAPISerializer = require('./jsonapi-serializer');

class serieSerializer extends JSONAPISerializer {

  constructor() {
    super('serie');
  }

  serializeAttributes(model, data) {
    data.attributes['name'] = model.name;

  }

  serializeRelationships(model, data) {

    if (model.courses) {
      data.relationship = {
        courses: {
          data: []
        }
      };
      for (const course of model.courses) {
        data.relationship.courses.data.push({
          'id' : course.id,
          'type': 'course'
        });
      }
    }
  }

  deserialize() {}

}

module.exports = new serieSerializer();
