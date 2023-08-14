const Interview = require("../models/interview");
const Student = require("../models/student");

// render add student page
module.exports.addStudent = (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("add_student", {
      title: "Add Student",
    });
  }
  return res.redirect("/");
};

// render edit student page
module.exports.editStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (req.isAuthenticated()) {
    return res.render("edit_student", {
      title: "Edit Student",
      student_details: student,
    });
  }

  return res.redirect("/");
};

// creating a new Student
module.exports.create = async (req, res) => {
  try {
    const {
      name,
      email,
      batch,
      college,
      placementStatus,
      dsa_score,
      react_score,
      webdev_score,
    } = req.body;

    const existingStudent = await Student.findOne({ email });

    if (!existingStudent) {
      const newStudent = await Student.create({
        name,
        email,
        college,
        batch,
        dsaScore: dsa_score,
        reactScore: react_score,
        webdScore: webdev_score,
        placed: placementStatus,
      });

      console.log("Student successfully created");
      return res.redirect("back");
    } else {
      console.log("Student already exists in the database");
      return res.redirect("back");
    }
  } catch (error) {
    console.log("Error:", error.message || "Error in creating new student");
    return res.redirect("back");
  }
};

// Deletion of student
module.exports.destroy = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return;
    }

    const interviewsOfStudent = student.interviews;

    if (interviewsOfStudent.length > 0) {
      for (let interview of interviewsOfStudent) {
        try {
          await Interview.findOneAndUpdate(
            { company: interview.company },
            { $pull: { students: { student: studentId } } }
          );
        } catch (error) {
          console.log("Error updating interview:", error.message || error);
        }
      }
    }

    await Student.findByIdAndRemove(studentId);

    return res.redirect("back");
  } catch (error) {
    console.log("Error:", error.message || error);
    return;
  }
};



// update student details
module.exports.update = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const {
      name,
      college,
      batch,
      dsa_score,
      react_score,
      webdev_score,
      placementStatus,
    } = req.body;

    if (!student) {
      return res.redirect("back");
    }

    student.name = name;
    student.college = college;
    student.batch = batch;
    student.dsaScore = dsa_score;
    student.reactScore = react_score;
    student.webdScore = webdev_score;
    student.placed = placementStatus;

    student.save();
    return res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    return res.redirect("back");
  }
};
