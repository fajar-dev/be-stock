import { Conversion } from '../entities/conversion.entity'

export class ConversionSerializer {
    static single(conversion: Conversion) {
        return {
            id: conversion.id,
            name: conversion.name,
            unitBasic: conversion.unitBasic ? {
                id: conversion.unitBasicId,
                name: conversion.unitBasic.name,
            } : null,
            value: Number(conversion.value),
            unitConversion: conversion.unitConversion ? {
                id: conversion.unitConversionId,
                name: conversion.unitConversion.name,
            } : null,
            remark: `1 ${conversion.unitBasic?.name || ''} = ${Number(conversion.value)} ${conversion.unitConversion?.name || ''}`,
            isActive: conversion.isActive,
            stocks: conversion.stockConversions?.map(sc => ({
                id: sc.stock?.id,
                code: sc.stock?.code,
                name: sc.stock?.name,
            })) ?? [],
            createdAt: conversion.createdAt
        }
    }

    static collection(conversions: Conversion[]) {
        return conversions.map((c) => this.single(c))
    }
}
