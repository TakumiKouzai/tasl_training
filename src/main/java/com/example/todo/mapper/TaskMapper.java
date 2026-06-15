package com.example.todo.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.todo.entity.Task;

@Mapper
public interface TaskMapper {

    @Select("""
            SELECT
                id,
                title,
                description,
                priority,
                status,
                created_at,
                updated_at
            FROM task
            ORDER BY
                CASE priority
                    WHEN 'A' THEN 1
                    WHEN 'B' THEN 2
                    WHEN 'C' THEN 3
                    ELSE 4
                END,
                id ASC
            """)
    List<Task> findAll();

    @Insert("""
            INSERT INTO task (
                title,
                description,
                priority,
                status,
                created_at,
                updated_at
            ) VALUES (
                #{title},
                #{description},
                #{priority},
                '未着手',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Task task);

    @Update("""
            UPDATE task
            SET
                title = #{title},
                description = #{description},
                priority = #{priority},
                status = #{status},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = #{id}
            """)
    void update(Task task);

    @Delete("""
            DELETE FROM task
            WHERE id = #{id}
            """)
    void deleteById(Long id);

    @Update("""
            UPDATE task
            SET
                status = #{status},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = #{id}
            """)
    void updateStatus(@Param("id") Long id, @Param("status") String status);
}