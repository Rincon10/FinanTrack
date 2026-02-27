package com.budget.api.service;

import com.budget.api.dto.request.CategoryRequest;
import com.budget.api.dto.response.CategoryResponse;
import com.budget.api.entity.Category;
import com.budget.api.entity.User;
import com.budget.api.exception.BadRequestException;
import com.budget.api.exception.ResourceNotFoundException;
import com.budget.api.mapper.CategoryMapper;
import com.budget.api.repository.CategoryRepository;
import com.budget.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(Long userId) {
        return categoryRepository.findAllByUserIdOrDefault(userId).stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(Long userId, CategoryRequest request) {
        if (categoryRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BadRequestException("Ya existe una categoría con ese nombre");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Category category = categoryMapper.toEntity(request);
        category.setUser(user);
        category = categoryRepository.save(category);

        log.info("Categoría creada: {} para usuario {}", category.getName(), userId);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long userId, Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        if (category.getIsDefault()) {
            throw new BadRequestException("No se pueden editar categorías por defecto");
        }

        categoryMapper.updateEntity(request, category);
        category = categoryRepository.save(category);

        log.info("Categoría actualizada: {}", categoryId);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        if (category.getIsDefault()) {
            throw new BadRequestException("No se pueden eliminar categorías por defecto");
        }

        categoryRepository.delete(category);
        log.info("Categoría eliminada: {}", categoryId);
    }
}
