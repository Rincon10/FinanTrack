package com.budget.api.service;

import com.budget.api.dto.request.TransactionRequest;
import com.budget.api.entity.Transaction;
import com.budget.api.enums.TransactionType;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String[] CSV_HEADER = {
            "Fecha", "Descripción", "Monto", "Tipo", "Categoría", "Notas"
    };

    public byte[] exportTransactions(List<Transaction> transactions) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos))) {
            writer.writeNext(CSV_HEADER);
            for (Transaction t : transactions) {
                writer.writeNext(new String[]{
                        t.getTransactionDate().format(DATE_FMT),
                        t.getDescription(),
                        t.getAmount().toPlainString(),
                        t.getType().name(),
                        t.getCategory() != null ? t.getCategory().getName() : "",
                        t.getNotes() != null ? t.getNotes() : ""
                });
            }
        }
        log.info("Exportadas {} transacciones a CSV", transactions.size());
        return baos.toByteArray();
    }

    public List<TransactionRequest> importTransactions(InputStream inputStream, Long budgetId)
            throws IOException, CsvValidationException {
        List<TransactionRequest> requests = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(inputStream))) {
            reader.readNext(); // Skip header
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 4) continue;

                TransactionRequest req = new TransactionRequest();
                req.setTransactionDate(LocalDate.parse(line[0], DATE_FMT));
                req.setDescription(line[1]);
                req.setAmount(new BigDecimal(line[2]));
                req.setType(TransactionType.valueOf(line[3].toUpperCase()));
                req.setBudgetId(budgetId);
                if (line.length > 5) {
                    req.setNotes(line[5]);
                }
                requests.add(req);
            }
        }
        log.info("Importadas {} transacciones desde CSV", requests.size());
        return requests;
    }
}
