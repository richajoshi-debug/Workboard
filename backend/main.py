
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, engine, Base
import models

from auth import (
    create_access_token,
    verify_access_token,
    hash_password,
    verify_password,
    oauth2_scheme
)


# Request schema

class Task(BaseModel):
    title: str
    description: str
    status: str = "pending"


# Application

app = FastAPI(
    title="WorkBoard API",
    description="Task Management System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# Database dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# JWT authentication dependency

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user_id = verify_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(models.UserModel).filter(
        models.UserModel.id == int(user_id)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# Home

@app.get("/")
def home():
    return {
        "message": "Welcome to WorkBoard API",
        "status": "running"
    }


# Health check

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# REGISTER

@app.post("/auth/register")
def register_user(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.UserModel).filter(
        models.UserModel.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.UserModel(
        email=email,
        hashed_password=hash_password(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# LOGIN

@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.UserModel).filter(
        models.UserModel.email == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# CURRENT USER

@app.get("/auth/me")
def get_my_profile(
    current_user: models.UserModel = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email
    }


# CREATE TASK

@app.post("/tasks")
def create_task(
    task: Task,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user)
):
    new_task = models.TaskModel(
        title=task.title,
        description=task.description,
        status=task.status,
        user_id=current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "status": new_task.status
    }


# READ ALL TASKS

@app.get("/tasks")
def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user)
):
    tasks = db.query(models.TaskModel).filter(
        models.TaskModel.user_id == current_user.id
    ).all()

    return {
        "total_tasks": len(tasks),
        "tasks": tasks
    }


# READ TASK BY ID

@app.get("/tasks/{task_id}")
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user)
):
    task = db.query(models.TaskModel).filter(
        models.TaskModel.id == task_id,
        models.TaskModel.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# UPDATE TASK

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    updated_task: Task,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user)
):
    task = db.query(models.TaskModel).filter(
        models.TaskModel.id == task_id,
        models.TaskModel.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.title = updated_task.title
    task.description = updated_task.description
    task.status = updated_task.status

    db.commit()
    db.refresh(task)

    return {"message": "Task updated successfully"}


# DELETE TASK

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user)
):
    task = db.query(models.TaskModel).filter(
        models.TaskModel.id == task_id,
        models.TaskModel.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
