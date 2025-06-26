
let  Course =  require('../models/Course.js')
let User = require('../models/User.js')

exports.enrollCourse = async (req, res) => {
  const { userId, title } = req.body;
  console.log('body')
  console.log(req.body)
  try {
    const user = await User.findById(userId);
    const course = await Course.findOne({ title: title });
    console.log(user)
    console.log(course)
    // ⛔️ Check if course exists
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // ✅ Calculate total sections
    const totalSections = course.lessons.reduce(
      (acc, lesson) => acc + lesson.sections.length,
      0
    );

    // ✅ Avoid re-enrolling
    const alreadyEnrolled = user?.enrolledCourses.find(
      (enrolled) => enrolled.title === title
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // ✅ Add course progress
    user?.enrolledCourses.push({
      title: title,
      numberOfSections: totalSections,
      completedSections: 0,
      progressPercentage: 0
    });

    await user.save();

    res.status(200).json({ message: 'Enrolled successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    console.log(user)
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update teacher flag
exports.updateTeacherFlag = async (req, res) => {
  try {
    const { teacher } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { teacher },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PATCH /api/users/:userId/enrolled/:courseTitle/complete
exports.completeSection = async (req, res) => {
  const { userId, courseTitle } = req.params;

  try {
    console.log(req.params)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(user)

    const course = user.enrolledCourses.find(c => c.title === courseTitle);
    if (!course) return res.status(404).json({ error: "Enrolled course not found" });
    console.log(course)

    course.completedSections = (course.completedSections || 0) + 1;

    let r = await user.save();
   
    console.log(r)
    res.status(200).json({ message: "Section count updated", course: r });
  } catch (err) {
    console.error(err);
    console.log(err)
    res.status(500).json({ error: "Failed to update completed section count" });
  }

}

exports.getSingleEnrolledCourse = async (req, res) => {
  const { userId, courseTitle } = req.params;

  try {
    const user = await User.findById(userId).select("enrolledCourses");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrolledCourse = user.enrolledCourses.find(
      (course) => course.title === courseTitle
    );

    if (!enrolledCourse) {
      return res.status(404).json({ error: "Enrolled course not found" });
    }

    res.status(200).json(enrolledCourse);
  } catch (err) {
    console.error("Error fetching enrolled course:", err);
    res.status(500).json({ error: "Server error fetching enrolled course" });
  }
};
