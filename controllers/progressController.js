let Progres = require('../models/Progress.js');
let Course = require('../models/Course.js');
let User = require('../models/User.js');

export const enrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const numberOfSections = course.lessons.reduce(
      (acc, lesson) => acc + lesson.sections.length, 0
    );

    const alreadyEnrolled = await Progress.findOne({ user: userId, courseId });
    if (alreadyEnrolled) return res.status(400).json({ error: 'Already enrolled' });

    const progress = new Progress({
      user: userId,
      courseId,
      numberOfSections
    });

    await progress.save();

    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId }
    });

    res.status(201).json({ message: 'Enrolled successfully', progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeSection = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    const progress = await Progress.findOne({ user: userId, courseId });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });

    if (progress.completedSections >= progress.numberOfSections) {
      return res.status(400).json({ error: 'Course already completed' });
    }

    progress.completedSections += 1;
    progress.progressPercentage = Math.floor(
      (progress.completedSections / progress.numberOfSections) * 100
    );

    await progress.save();

    // Optionally update points in the User model
    const user = await User.findById(userId);
    user.totalPoints += 10;

    // Bonus: check if lesson or course is fully completed
    if (progress.progressPercentage === 100) {
      user.totalPoints += 100; // Course completion bonus
    }

    await user.save();

    res.json({ message: 'Section completed', progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
