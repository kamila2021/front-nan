import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7D0303',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 110,
  },
  dateText: {
    fontSize: 10,
    color: '#555',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#7D0303',
  },
  section: {
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: '100%', // Aseguramos que la tabla ocupe todo el ancho disponible
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#7D0303',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#DADADA',
    borderRightWidth: 1,
    borderRightColor: '#7D0303',
    borderBottomWidth: 1,
    borderBottomColor: '#7D0303',
    textAlign: 'center',
    flex: 1, // Aseguramos que todas las celdas tengan el mismo ancho
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#7D0303',
    borderBottomWidth: 1,
    borderBottomColor: '#7D0303',
    textAlign: 'center',
    flex: 1, // Aseguramos que todas las celdas tengan el mismo ancho
  },
  lastTableCellHeader: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#DADADA',
    borderBottomWidth: 1,
    borderBottomColor: '#7D0303',
    textAlign: 'center',
    flex: 1,
  },
  lastTableCell: {
    padding: 5,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#7D0303',
    textAlign: 'center',
    flex: 1,
  },
  footer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

const PDF = ({ alumno, nivel, notas, asistencia, cursos }) => {
  const currentDate = new Date().toLocaleDateString();

  const getNotasPorCurso = (id_subject) => {
    const notasCurso = notas[id_subject] || [];
    const nota1 = notasCurso[0]?.grade || '-';
    const nota2 = notasCurso[1]?.grade || '-';
    const nota3 = notasCurso[2]?.grade || '-';
    return [nota1, nota2, nota3];
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabecera */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src="/logo-escuela.png" />
          <Text style={styles.dateText}>Fecha de generación: {currentDate}</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>Informe de {alumno.name} {alumno.lastname}</Text>
        <Text>Nivel: {nivel}</Text>

        <View style={styles.section}>
          <Text>Detalle de Cursos y Notas:</Text>
          <View style={styles.table}>
            {/* Encabezados de la tabla */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Asignatura</Text>
              <Text style={styles.tableCellHeader}>% Asistencia</Text>
              <Text style={styles.tableCellHeader}>Nota 1</Text>
              <Text style={styles.tableCellHeader}>Nota 2</Text>
              <Text style={styles.lastTableCellHeader}>Nota 3</Text>
            </View>

            {/* Datos de la tabla */}
            {cursos.map((curso) => {
              const [nota1, nota2, nota3] = getNotasPorCurso(curso.id_subject);
              const asistenciaCurso = asistencia[curso.id_subject];

              return (
                <View key={curso.id_subject} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{curso.name}</Text>
                  <Text style={styles.tableCell}>
                    {asistenciaCurso !== undefined && asistenciaCurso !== null
                      ? `${asistenciaCurso.toFixed(2)}%`
                      : 'Sin datos'}
                  </Text>
                  <Text style={styles.tableCell}>{nota1}</Text>
                  <Text style={styles.tableCell}>{nota2}</Text>
                  <Text style={styles.lastTableCell}>{nota3}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pie de página */}
        <Text style={styles.footer}>Este informe es confidencial y está destinado únicamente para el uso del destinatario.</Text>
      </Page>
    </Document>
  );
};

export default PDF;
