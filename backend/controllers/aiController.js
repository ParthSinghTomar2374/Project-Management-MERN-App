const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const generateAiSummary = asyncHandler(async (req, res) => {
  const issueId = req.params.issueId;

  const issue = await Issue.findById(issueId);
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const comments = await Comment.find({ issueId }).populate('userId', 'name').sort('createdAt');
  if (comments.length === 0) {
    res.status(400);
    throw new Error('No comments to summarize');
  }

  const discussionContext = comments.map(c => `${c.userId.name}: ${c.commentText}`).join('\n');

  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({
      summary: "This is a dummy AI summary because no valid API key was provided. The user discussion covered various aspects of the bug report tracked within the application.",
      actionItems: ["Provide a real Groq API key", "Test AI summarization integration"],
      nextStep: "Update the .env file with GROQ_API_KEY or proceed with the placeholder response."
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an AI assistant for a project tracking platform. Summarize the following discussion.
Return a JSON object with strictly these properties: 'summary' (string), 'actionItems' (array of strings), and 'nextStep' (string).

Issue Title: ${issue.title}
Issue Description: ${issue.description}

Discussion:
${discussionContext}`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(response.choices[0].message.content);

    const project = await Project.findById(issue.projectId);
    if (project && project.members && project.members.length > 0) {
      const notifications = project.members.map(memberId => ({
        userId: memberId,
        message: `An AI summary was just generated for issue: ${issue.title}`,
        issueId: issue._id,
        projectId: project._id,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json(aiResponse);

  } catch (error) {
    console.warn("AI summarization API failed (e.g., quota exceeded). Falling back to mock response.", error.message);
    
    const project = await Project.findById(issue.projectId);
    if (project && project.members && project.members.length > 0) {
      const notifications = project.members.map(memberId => ({
        userId: memberId,
        message: `An AI summary was just generated for issue: ${issue.title}`,
        issueId: issue._id,
        projectId: project._id,
      }));
      await Notification.insertMany(notifications);
    }

    return res.status(200).json({
      summary: "This is a dummy AI summary because the API request failed (e.g., insufficient quota). The user discussion covered various aspects of the bug report tracked within the application.",
      actionItems: ["Check Groq API billing/quota", "Test AI summarization integration"],
      nextStep: "Verify the GROQ_API_KEY has active credits or proceed with the placeholder response."
    });
  }
});

module.exports = { generateAiSummary };
