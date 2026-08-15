"""CRUD de recetas/articulos del blog. Lectura publica, escritura admin/vendedor."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.content import BlogPost
from app.schemas.content import BlogPostCreate, BlogPostUpdate, BlogPostOut


router = APIRouter(prefix="/blog-posts", tags=["blog"])


@router.get("", response_model=List[BlogPostOut])
def list_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.sort_order).all()


@router.post("", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db)):
    p = BlogPost(**payload.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.patch("/{post_id}", response_model=BlogPostOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_post(post_id: int, payload: BlogPostUpdate, db: Session = Depends(get_db)):
    p = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Articulo no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p


@router.delete("/{post_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_post(post_id: int, db: Session = Depends(get_db)):
    p = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Articulo no encontrado")
    db.delete(p); db.commit()
