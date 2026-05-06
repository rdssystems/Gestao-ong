import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user (default)
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', password: hashedPassword, name: 'Administrador', role: 'admin' },
  });

  // Admin user (Klisman)
  const hashedPasswordAdmin = await bcrypt.hash('32166096', 10);
  await prisma.user.upsert({
    where: { email: 'klismanrds@gmail.com' },
    update: { password: hashedPasswordAdmin },
    create: { email: 'klismanrds@gmail.com', password: hashedPasswordAdmin, name: 'Klisman', role: 'admin' },
  });

  // Conta de teste
  const hashedPasswordTeste = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'teste@teste.com' },
    update: { password: hashedPasswordTeste },
    create: { email: 'teste@teste.com', password: hashedPasswordTeste, name: 'Teste', role: 'admin' },
  });

  // Tipos de Curso
  const tiposData = [
    { nome: 'Informática', descricao: 'Cursos de tecnologia e computação', cor: '#0ea5e9' },
    { nome: 'Artesanato', descricao: 'Cursos de artes manuais', cor: '#f59e0b' },
    { nome: 'Música', descricao: 'Cursos de instrumentos e canto', cor: '#8b5cf6' },
    { nome: 'Esportes', descricao: 'Atividades esportivas e físicas', cor: '#10b981' },
    { nome: 'Idiomas', descricao: 'Cursos de línguas estrangeiras', cor: '#ef4444' },
    { nome: 'Culinária', descricao: 'Cursos de gastronomia', cor: '#ec4899' },
  ];

  const tipos: any[] = [];
  for (const t of tiposData) {
    const tipo = await prisma.tipoCurso.upsert({
      where: { nome: t.nome },
      update: { descricao: t.descricao, cor: t.cor },
      create: t,
    });
    tipos.push(tipo);
  }

  // Alunos
  const alunosData = [
    { nomeCompleto: 'Maria Silva Santos', cpf: '123.456.789-00', sexo: 'Feminino', tipoDocumento: 'CPF', numeroDocumento: '123.456.789-00', telefone: '(11) 98765-4321', whatsapp: '(11) 98765-4321', cidade: 'São Paulo', bairro: 'Centro', endereco: 'Rua das Flores', numero: '123', nomeMae: 'Ana Silva' },
    { nomeCompleto: 'João Pedro Oliveira', cpf: '234.567.890-11', sexo: 'Masculino', tipoDocumento: 'RG', numeroDocumento: '45.678.901-2', telefone: '(11) 91234-5678', whatsapp: '(11) 91234-5678', cidade: 'São Paulo', bairro: 'Vila Mariana', endereco: 'Av. Paulista', numero: '456', nomeMae: 'Cláudia Oliveira' },
    { nomeCompleto: 'Ana Beatriz Costa', cpf: '345.678.901-22', sexo: 'Feminino', tipoDocumento: 'Certidão de Nascimento', numeroDocumento: '098765', numeroCertidao: '098765 01 55 2015 1 00001 001 0000001 01', telefone: '(11) 93456-7890', cidade: 'Guarulhos', bairro: 'Centro', endereco: 'Rua Esperança', numero: '78', nomeMae: 'Rosa Costa' },
    { nomeCompleto: 'Lucas Ferreira Lima', cpf: '456.789.012-33', sexo: 'Masculino', tipoDocumento: 'CPF', numeroDocumento: '456.789.012-33', telefone: '(21) 99876-5432', cidade: 'Rio de Janeiro', bairro: 'Copacabana', endereco: 'Rua Barata Ribeiro', numero: '200' },
    { nomeCompleto: 'Gabriela Souza Ramos', cpf: '567.890.123-44', sexo: 'Feminino', tipoDocumento: 'RG', numeroDocumento: '56.789.012-3', cidade: 'Campinas', bairro: 'Cambuí', endereco: 'Rua Barão de Jaguara', numero: '55', nomeMae: 'Fernanda Souza' },
    { nomeCompleto: 'Pedro Henrique Almeida', cpf: '678.901.234-55', sexo: 'Masculino', tipoDocumento: 'CPF', numeroDocumento: '678.901.234-55', cidade: 'São Paulo', endereco: 'Rua Augusta', numero: '300' },
    { nomeCompleto: 'Juliana Martins', cpf: '789.012.345-66', sexo: 'Feminino', tipoDocumento: 'RG', numeroDocumento: '78.901.234-5', cidade: 'Osasco', endereco: 'Av. dos Autonomistas', numero: '150' },
    { nomeCompleto: 'Rafael Santos Neto', cpf: '890.123.456-77', sexo: 'Masculino', tipoDocumento: 'CPF', numeroDocumento: '890.123.456-77', cidade: 'São Bernardo', endereco: 'Rua Marechal Deodoro', numero: '88' },
  ];

  const alunos: any[] = [];
  for (const a of alunosData) {
    const aluno = await prisma.aluno.upsert({
      where: { cpf: a.cpf },
      update: { nomeCompleto: a.nomeCompleto, sexo: (a as any).sexo, tipoDocumento: (a as any).tipoDocumento, numeroDocumento: (a as any).numeroDocumento },
      create: a,
    });
    alunos.push(aluno);
  }

  // Add some interests
  const interesses = [
    { alunoIdx: 0, tipoIdx: 0 }, { alunoIdx: 0, tipoIdx: 2 },
    { alunoIdx: 1, tipoIdx: 0 }, { alunoIdx: 1, tipoIdx: 3 },
    { alunoIdx: 2, tipoIdx: 1 }, { alunoIdx: 2, tipoIdx: 4 },
    { alunoIdx: 3, tipoIdx: 3 }, { alunoIdx: 3, tipoIdx: 0 },
    { alunoIdx: 4, tipoIdx: 5 }, { alunoIdx: 4, tipoIdx: 1 },
    { alunoIdx: 5, tipoIdx: 0 },
    { alunoIdx: 6, tipoIdx: 4 },
    { alunoIdx: 7, tipoIdx: 2 },
  ];

  for (const int of interesses) {
    const alunoId = alunos[int.alunoIdx]?.id;
    const tipoCursoId = tipos[int.tipoIdx]?.id;
    if (alunoId && tipoCursoId) {
      await prisma.alunoInteresse.upsert({
        where: { alunoId_tipoCursoId: { alunoId, tipoCursoId } },
        update: {},
        create: { alunoId, tipoCursoId },
      });
    }
  }

  // Cursos
  const cursosData = [
    { nome: 'Informática Básica', tipoIdx: 0, cargaHoraria: 60, vagas: 25, turno: 'Manhã', diasSemana: 'Seg, Qua, Sex', professor: 'Carlos Mendes', status: 'Em Andamento', dataInicio: new Date('2026-03-01'), dataFim: new Date('2026-06-30') },
    { nome: 'Violão Iniciante', tipoIdx: 2, cargaHoraria: 40, vagas: 15, turno: 'Tarde', diasSemana: 'Ter, Qui', professor: 'Paulo Rêgo', status: 'Inscrições Abertas', dataInicio: new Date('2026-05-01'), dataFim: new Date('2026-08-31') },
    { nome: 'Crochê e Tricô', tipoIdx: 1, cargaHoraria: 30, vagas: 20, turno: 'Tarde', diasSemana: 'Seg, Qua', professor: 'Dona Maria', status: 'Inscrições Abertas', dataInicio: new Date('2026-05-15'), dataFim: new Date('2026-07-15') },
    { nome: 'Futsal', tipoIdx: 3, cargaHoraria: 48, vagas: 30, turno: 'Manhã', diasSemana: 'Ter, Qui, Sáb', professor: 'Roberto Alves', status: 'Em Andamento', dataInicio: new Date('2026-02-15'), dataFim: new Date('2026-06-15') },
    { nome: 'Inglês Básico', tipoIdx: 4, cargaHoraria: 80, vagas: 20, turno: 'Noite', diasSemana: 'Seg, Qua', professor: 'Amanda Brown', status: 'Inscrições Abertas', dataInicio: new Date('2026-06-01'), dataFim: new Date('2026-12-01') },
    { nome: 'Culinária Básica', tipoIdx: 5, cargaHoraria: 24, vagas: 12, turno: 'Manhã', diasSemana: 'Sáb', professor: 'Chef Marcos', status: 'Concluído', dataInicio: new Date('2026-01-10'), dataFim: new Date('2026-03-28') },
  ];

  const cursos: any[] = [];
  for (const c of cursosData) {
    const existing = await prisma.curso.findFirst({ where: { nome: c.nome, tipoCursoId: tipos[c.tipoIdx]?.id } });
    if (existing) {
      cursos.push(existing);
    } else {
      const curso = await prisma.curso.create({
        data: {
          nome: c.nome,
          tipoCursoId: tipos[c.tipoIdx]?.id,
          cargaHoraria: c.cargaHoraria,
          vagas: c.vagas,
          turno: c.turno,
          diasSemana: c.diasSemana,
          professor: c.professor,
          status: c.status,
          dataInicio: c.dataInicio,
          dataFim: c.dataFim,
        },
      });
      cursos.push(curso);
    }
  }

  // Matrículas
  const matriculasData = [
    { alunoIdx: 0, cursoIdx: 0 },
    { alunoIdx: 1, cursoIdx: 0 },
    { alunoIdx: 3, cursoIdx: 0 },
    { alunoIdx: 5, cursoIdx: 0 },
    { alunoIdx: 0, cursoIdx: 1 },
    { alunoIdx: 7, cursoIdx: 1 },
    { alunoIdx: 2, cursoIdx: 2 },
    { alunoIdx: 4, cursoIdx: 2 },
    { alunoIdx: 1, cursoIdx: 3 },
    { alunoIdx: 3, cursoIdx: 3 },
    { alunoIdx: 2, cursoIdx: 4 },
    { alunoIdx: 6, cursoIdx: 4 },
    { alunoIdx: 4, cursoIdx: 5 },
  ];

  for (const m of matriculasData) {
    const alunoId = alunos[m.alunoIdx]?.id;
    const cursoId = cursos[m.cursoIdx]?.id;
    if (alunoId && cursoId) {
      const existing = await prisma.matricula.findUnique({
        where: { alunoId_cursoId: { alunoId, cursoId } },
      });
      if (!existing) {
        await prisma.matricula.create({ data: { alunoId, cursoId } });
        await prisma.curso.update({ where: { id: cursoId }, data: { vagasOcupadas: { increment: 1 } } });
      }
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
