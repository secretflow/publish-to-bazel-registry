import { Injectable } from "@nestjs/common";
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.js';
import fs from "fs";

@Injectable()
export class GitClient {
  public async shallowClone(url: string, diskPath: string, branchOrTag?: string): Promise<void> {
    await git.clone({
      fs,
      http,
      dir: diskPath,
      url,
      ref: branchOrTag || "main",
      singleBranch: true,
      depth: 1,
    });
  }

  public async setUserNameAndEmail(
    repoPath: string,
    name: string,
    email: string
  ): Promise<void> {
    await git.setConfig({
      fs,
      dir: repoPath,
      path: "user.name",
      value: name,
    });
    await git.setConfig({
      fs,
      dir: repoPath,
      path: "user.email",
      value: email,
    });
  }

  public async checkoutNewBranchFromHead(
    repoPath: string,
    branch: string
  ): Promise<void> {
    await git.branch({
      fs,
      dir: repoPath,
      ref: branch,
      checkout: true,
    });
  }

  public async commitChanges(
    repoPath: string,
    commitMsg: string
  ): Promise<void> {
    await git.add({ fs, dir: repoPath, filepath: "." });
    await git.commit({
      fs,
      dir: repoPath,
      message: commitMsg,
      author: {
        name: await git.getConfig({ fs, dir: repoPath, path: "user.name" }),
        email: await git.getConfig({ fs, dir: repoPath, path: "user.email" }),
      },
    });
  }

  public async hasRemote(repoPath: string, remote: string): Promise<boolean> {
    const remotes = await git.listRemotes({ fs, dir: repoPath });
    return remotes.some((r) => r.remote === remote);
  }

  public async addRemote(
    repoPath: string,
    remote: string,
    url: string
  ): Promise<void> {
    await git.addRemote({ fs, dir: repoPath, remote, url });
  }

  public async push(
    repoPath: string,
    remote: string,
    branch: string
  ): Promise<void> {
    await git.push({
      fs,
      http,
      dir: repoPath,
      remote,
      ref: branch,
    });
  }
}
