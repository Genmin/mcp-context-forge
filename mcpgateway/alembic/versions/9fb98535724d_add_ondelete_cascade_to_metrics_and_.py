"""add_ondelete_cascade_to_metrics_and_associations

Revision ID: 9fb98535724d
Revises: bb43712cae28
Create Date: 2026-04-28 15:14:01.089813

"""

# Standard
from typing import Sequence, Union

# Third-Party
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9fb98535724d"
down_revision: Union[str, Sequence[str], None] = "bb43712cae28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add CASCADE ondelete to foreign keys in metrics and association tables.

    This migration fixes issue #4478 where DELETE operations on tools, resources,
    and prompts fail with FK constraint violations after the entities have been
    invoked at least once (creating metrics rows).

    The migration is idempotent - it checks for table existence before attempting
    modifications to support both fresh databases (which use db.py models directly)
    and existing databases that need the schema update.
    """
    inspector = sa.inspect(op.get_bind())

    # Get database dialect
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    # Skip if tables don't exist (fresh DB uses db.py models directly)
    existing_tables = inspector.get_table_names()

    # ========================================================================
    # 1. Update tool_metrics.tool_id FK to CASCADE
    # ========================================================================
    if "tool_metrics" in existing_tables:
        with op.batch_alter_table("tool_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("tool_metrics_tool_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("tool_metrics_tool_id_fkey" if dialect_name == "postgresql" else None, "tools", ["tool_id"], ["id"], ondelete="CASCADE")

    # ========================================================================
    # 2. Update resource_metrics.resource_id FK to CASCADE
    # ========================================================================
    if "resource_metrics" in existing_tables:
        with op.batch_alter_table("resource_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("resource_metrics_resource_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("resource_metrics_resource_id_fkey" if dialect_name == "postgresql" else None, "resources", ["resource_id"], ["id"], ondelete="CASCADE")

    # ========================================================================
    # 3. Update prompt_metrics.prompt_id FK to CASCADE
    # ========================================================================
    if "prompt_metrics" in existing_tables:
        with op.batch_alter_table("prompt_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("prompt_metrics_prompt_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("prompt_metrics_prompt_id_fkey" if dialect_name == "postgresql" else None, "prompts", ["prompt_id"], ["id"], ondelete="CASCADE")

    # ========================================================================
    # 4. Update server_tool_association FKs to CASCADE
    # ========================================================================
    if "server_tool_association" in existing_tables:
        with op.batch_alter_table("server_tool_association", schema=None) as batch_op:
            # Drop existing FKs
            batch_op.drop_constraint("server_tool_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_tool_association_tool_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            # Recreate with CASCADE
            batch_op.create_foreign_key("server_tool_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"], ondelete="CASCADE")
            batch_op.create_foreign_key("server_tool_association_tool_id_fkey" if dialect_name == "postgresql" else None, "tools", ["tool_id"], ["id"], ondelete="CASCADE")

    # ========================================================================
    # 5. Update server_resource_association FKs to CASCADE
    # ========================================================================
    if "server_resource_association" in existing_tables:
        with op.batch_alter_table("server_resource_association", schema=None) as batch_op:
            # Drop existing FKs
            batch_op.drop_constraint("server_resource_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_resource_association_resource_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            # Recreate with CASCADE
            batch_op.create_foreign_key("server_resource_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"], ondelete="CASCADE")
            batch_op.create_foreign_key("server_resource_association_resource_id_fkey" if dialect_name == "postgresql" else None, "resources", ["resource_id"], ["id"], ondelete="CASCADE")

    # ========================================================================
    # 6. Update server_prompt_association FKs to CASCADE
    # ========================================================================
    if "server_prompt_association" in existing_tables:
        with op.batch_alter_table("server_prompt_association", schema=None) as batch_op:
            # Drop existing FKs
            batch_op.drop_constraint("server_prompt_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_prompt_association_prompt_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            # Recreate with CASCADE
            batch_op.create_foreign_key("server_prompt_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"], ondelete="CASCADE")
            batch_op.create_foreign_key("server_prompt_association_prompt_id_fkey" if dialect_name == "postgresql" else None, "prompts", ["prompt_id"], ["id"], ondelete="CASCADE")


def downgrade() -> None:
    """Revert CASCADE ondelete back to default (NO ACTION).

    This downgrade is provided for completeness but should rarely be needed,
    as the CASCADE behavior is the correct fix for the FK constraint issue.
    """
    inspector = sa.inspect(op.get_bind())
    bind = op.get_bind()
    dialect_name = bind.dialect.name
    existing_tables = inspector.get_table_names()

    # Revert in reverse order
    if "server_prompt_association" in existing_tables:
        with op.batch_alter_table("server_prompt_association", schema=None) as batch_op:
            batch_op.drop_constraint("server_prompt_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_prompt_association_prompt_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("server_prompt_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"])
            batch_op.create_foreign_key("server_prompt_association_prompt_id_fkey" if dialect_name == "postgresql" else None, "prompts", ["prompt_id"], ["id"])

    if "server_resource_association" in existing_tables:
        with op.batch_alter_table("server_resource_association", schema=None) as batch_op:
            batch_op.drop_constraint("server_resource_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_resource_association_resource_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("server_resource_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"])
            batch_op.create_foreign_key("server_resource_association_resource_id_fkey" if dialect_name == "postgresql" else None, "resources", ["resource_id"], ["id"])

    if "server_tool_association" in existing_tables:
        with op.batch_alter_table("server_tool_association", schema=None) as batch_op:
            batch_op.drop_constraint("server_tool_association_server_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.drop_constraint("server_tool_association_tool_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("server_tool_association_server_id_fkey" if dialect_name == "postgresql" else None, "servers", ["server_id"], ["id"])
            batch_op.create_foreign_key("server_tool_association_tool_id_fkey" if dialect_name == "postgresql" else None, "tools", ["tool_id"], ["id"])

    if "prompt_metrics" in existing_tables:
        with op.batch_alter_table("prompt_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("prompt_metrics_prompt_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("prompt_metrics_prompt_id_fkey" if dialect_name == "postgresql" else None, "prompts", ["prompt_id"], ["id"])

    if "resource_metrics" in existing_tables:
        with op.batch_alter_table("resource_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("resource_metrics_resource_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("resource_metrics_resource_id_fkey" if dialect_name == "postgresql" else None, "resources", ["resource_id"], ["id"])

    if "tool_metrics" in existing_tables:
        with op.batch_alter_table("tool_metrics", schema=None) as batch_op:
            batch_op.drop_constraint("tool_metrics_tool_id_fkey" if dialect_name == "postgresql" else None, type_="foreignkey")
            batch_op.create_foreign_key("tool_metrics_tool_id_fkey" if dialect_name == "postgresql" else None, "tools", ["tool_id"], ["id"])
