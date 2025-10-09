// controllers/courseController.js
const Course = require('../models/Course.js');

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get one course by ID
exports.getCourseById = async (req, res) => {
    try {
        console.log(req.params.title)
        const course = await Course.findOne({ title: req.params.title });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new course (basic setup, details can be extended)
exports.createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ error: 'id, title, and description are required' });
        }

        const existing = await Course.findOne({ title });
        console.log(existing)
        if (existing) {
            return res.status(409).json({ error: 'Course with this ID already exists' });
        }
        console.log(req.body)
        const newCourse = new Course({ title, description, lessons: [] });
        await newCourse.save();

        res.status(201).json(newCourse);
    } catch (error) {
        console.log(req.body)
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};
// Add Lesson to Course
exports.addLessonToCourse = async (req, res) => {
    try {
        const t = req.params.title;
        const { lessonNumber, lessonId, title, sections } = req.body;

        const course = await Course.findOne({ title: t });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const newLesson = {
            lessonNumber,
            lessonId,
            title,
            sections,
        };
        console.log(newLesson)
        course.lessons.push(newLesson);
        await course.save();

        res.status(201).json({ message: 'Lesson added', lesson: newLesson });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to add lesson' });
    }
};

// Add Section to Lesson in a Course
exports.addSectionToLesson = async (req, res) => {
    try {
        const { title, lessonId } = req.params;
        const sectionData = req.body;

        const course = await Course.findOne({ title: title });
        const totalSectionsAcrossCourse = course.lessons.reduce((acc, lesson) => acc + lesson.sections.length, 0);
        console.log('here')
        console.log(totalSectionsAcrossCourse)
        req.body.sectionNumber = totalSectionsAcrossCourse;
        if (!course) return res.status(404).json({ error: 'Course not found' });
      

        const lesson = course.lessons.find(l => l.lessonId === lessonId);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        lesson.sections.push(sectionData);

        let data = await course.save();
        //console.log(data.lessons[0].sections)
        res.status(201).json({ message: 'Section added', section: sectionData });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to add section' });
    }
};
// PATCH: Update course details (title or description)
exports.updateCourseDetails = async (req, res) => {
    const { title } = req.params;
    const updatedLessons = req.body.lessons;
    console.log(updatedLessons)
    try {
        const updatedCourse = await Course.findOneAndUpdate(
            { title },
            { 
              lessons: updatedLessons,
            },
            { new: true } // returns the updated document
        );

        if (!updatedCourse) return res.status(404).json({ error: "Course not found" });

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// PATCH: Update a lesson title
// controllers/courseController.js
exports.updateLesson = async (req, res) => {
    try {
        const { title, lessonNumber } = req.params;
        const newLessonData = req.body;

        // Validate new lesson data (you can add more checks)
        if (!newLessonData.lessonNumber || !newLessonData.sections) {
            return res.status(400).json({ error: "lessonId, lessonNumber, and sections are required." });
        }

        const course = await Course.findOne({ title });
        if (!course) return res.status(404).json({ error: "Course not found" });

        const index = course.lessons.findIndex(l => l.lessonNumber === Number(lessonNumber));
        if (index === -1) return res.status(404).json({ error: "Lesson not found" });

        // Replace lesson
        course.lessons[index] = newLessonData;

        await course.save();
        res.status(200).json({ message: "Lesson replaced", lesson: newLessonData });
    } catch (err) {
        console.error("Error replacing lesson:", err);
        res.status(500).json({ error: "Failed to replace lesson" });
    }
};


// PATCH: Update a section title
exports.updateSection = async (req, res) => {
    const { title, lessonNumber, sectionNumber } = req.params;
    const { t } = req.body;
    try {
        console.log(t)
        const course = await Course.findById(title);
        const lesson = course?.lessons[parseInt(lessonNumber)];
        const section = lesson?.sections[parseInt(sectionNumber)];

        if (!section) return res.status(404).json({ error: "Section not found" });

        section.title = title;
        await course.save();
        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH: Update a block
exports.updateBlock = async (req, res) => {
    const { courseId, lessonNumber, sectionNumber, blockType } = req.params;
    const blockData = req.body;

    try {
        const course = await Course.findById(courseId);
        const lesson = course?.lessons[parseInt(lessonNumber)];
        const section = lesson?.sections[parseInt(sectionNumber)];

        if (!section) return res.status(404).json({ error: "Section not found" });

        section[blockType] = { ...section[blockType], ...blockData };
        await course.save();
        res.status(200).json(section[blockType]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCode = async(req, res=>{
    const { courseId, lessonNumber, sectionNumber } = req.params;
    const language = req.body.language;
    try {
        const course = await Course.findById(courseId);
        const lesson = course?.lessons[parseInt(lessonNumber)];
        const section = lesson?.sections[parseInt(sectionNumber)];

        if (!section) return res.status(404).json({ error: "Section not found" });

        //section[blockType] = { ...section[blockType], ...blockData };
        const codeSnippet = section.codes.find(c=> c.language === language)
        res.status(200).json({codeSnippet: codeSnippet.text});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
})
