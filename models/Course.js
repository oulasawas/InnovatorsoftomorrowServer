const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionNumber: Number,
  title: String,
  img: String,
  characterIntro: String,
  description: String,
  gifs: { type: [String], default: undefined  },  // fixed from String → [String]
  funFact: {
    description: { type: String },
    gifs: { type: [String], default: undefined  }
  },
  problem: { type: String, required: false },
  codes: [
    language: {type: String, required:true},
    text: { type: String, required: false },
    gifs: { type: [String], default: undefined  }

  ],
  challenge: {
    description: { type: String, required: false },
    hint: { type: String, required: false },
    gifs: { type: [String], default: undefined  }

  },
  finalQuest: {
    description: { type: String, required: false },
    code: { type: String, required: false },
    hint: { type: String, required: false },
    gifs: { type: [String], default: undefined  }

  },
  topic: {
    title: { type: String, required: false },
    characterIntro: { type: String, required: false },
    description: { type: String, required: false },
    gifs: { type: [String], default: undefined  }

  }
});

const lessonSchema = new mongoose.Schema({
  lessonNumber: Number,
  lessonId: String,
  title: String,
  sections: [sectionSchema]
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  lessons: [lessonSchema]
});

module.exports = mongoose.model('Course', courseSchema);
