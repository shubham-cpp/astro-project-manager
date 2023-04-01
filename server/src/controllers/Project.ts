import type { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Project, { ProjectType } from '../models/Project';
import { BadRequest, compareArrays, NotFound } from '../utils';

export const getProjectsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: projectOwner } = req.params;
    const projects = await Project.find({ projectOwner });
    res.json({
      success: true,
      data: projects.length ? projects : null,
      message: projects.length ? null : 'No projects found',
    });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) throw new NotFound(`Project with id=${id} not found`);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// TODO: handle members and tasks
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectBody = req.body as ProjectType;
    const { name, description, projectId, projectOwner } = projectBody;

    const projectExists = await Project.findOne({ projectId });
    if (projectExists) throw new BadRequest(`Project with id=${projectId} already exists`);

    const project = await Project.create({
      name,
      description,
      projectId,
      projectOwner,
    });
    res.status(201).json({
      success: true,
      data: {
        projectId: project._id,
        name: project.name,
        description: project.description,
      },
      message: 'Project created successfully',
    });
  } catch (err) {
    next(err);
  }
};

// TODO: handle members and tasks
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const projectBody = req.body as ProjectType;
    const { name, description, projectOwner, tasks, members } = projectBody;
    const project = await Project.findById(id);

    if (!project) throw new NotFound(`Project with id=${id} not found`);

    if (name) project.name = name;
    if (description) project.description = description;
    if (projectOwner) project.projectOwner = projectOwner;
    if (compareArrays(tasks, project.tasks)) project.tasks = tasks;
    if (compareArrays(members, project.members)) project.members = members;

    await project.save();

    res.json({
      success: true,
      data: {
        projectId: project.projectId,
        name: project.name,
        description: project.description,
      },
      message: 'Project updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({
      success: true,
      data: null,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const createProjectValidation = [
  body('name').notEmpty().isString().isLength({ min: 3 }),
  body('description').notEmpty().isString().isLength({ min: 5 }),
  body('projectId')
    .matches(/^([A-Za-z]{3})-([0-9]+)$/)
    .withMessage(
      'Project Id should be in format INT-123. 3 letter one - and then followed with numbers',
    ),
  body('projectOwner').isMongoId(),
];

export const updateProjectValition = [
  param('id').notEmpty().isMongoId().bail(),
  body('name').optional().notEmpty().isString().isLength({ min: 3 }),
  body('description').optional().notEmpty().isString().isLength({ min: 5 }),
  body('projectOwner').optional().isMongoId(),
];
